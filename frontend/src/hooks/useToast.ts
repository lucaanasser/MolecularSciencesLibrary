import * as React from "react"
import { logger } from "@/utils/logger";

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

/**
 * Hook para exibir toasts/avisos.
 * Padrão de logs:
 * 🔵 Início de operação
 * 🟢 Sucesso
 * 🟡 Aviso/Fluxo alternativo
 * 🔴 Erro
 */

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      logger.info("🔵 [use-toast] Adicionando toast:", action.toast.title || action.toast.description);
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      logger.info("🟢 [use-toast] Atualizando toast:", action.toast.id);
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        logger.warn("🟡 [use-toast] Dismiss toast:", toastId);
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          logger.warn("🟡 [use-toast] Dismiss all toasts");
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        logger.info("🟢 [use-toast] Removendo todos os toasts");
        return {
          ...state,
          toasts: [],
        }
      }
      logger.info("🟢 [use-toast] Removendo toast:", action.toastId);
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

/**
 * Converte em texto qualquer valor que o React não saiba renderizar como filho.
 *
 * O caso que motivou isto: um `catch (err)` passava o próprio Error como
 * `description`, e o React lançava "Objects are not valid as a React child".
 * Como o <Toaster /> fica na raiz da árvore e fora de qualquer ErrorBoundary,
 * o app inteiro desmontava (tela branca) justamente quando havia uma mensagem
 * de erro para mostrar. Normalizar aqui, no ponto de entrada, garante que
 * nenhum chamador consiga derrubar a UI.
 */
function toRenderableNode(value: unknown): React.ReactNode {
  if (value === null || value === undefined || typeof value !== "object") {
    return value as React.ReactNode
  }
  if (React.isValidElement(value) || Array.isArray(value)) {
    return value as React.ReactNode
  }
  if (value instanceof Error) return value.message
  const message = (value as { message?: unknown }).message
  if (typeof message === "string") return message
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: {
        ...props,
        title: toRenderableNode(props.title),
        description: toRenderableNode(props.description),
        id,
      },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      title: toRenderableNode(props.title),
      description: toRenderableNode(props.description),
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
