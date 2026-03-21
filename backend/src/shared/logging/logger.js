/**
 * Logger padronizado do backend.
 * Fornece snippets reutilizaveis para logs com formato obrigatorio:
 * <EMOJI> [<Layer>] [<FileName>] [<FunctionName>] <mensagem> | <contexto-chave>
 */

const path = require('path');

const LEVEL_EMOJI = {
    start: '🔵',
    success: '🟢',
    warn: '🟡',
    error: '🔴'
};

const SENSITIVE_KEYS = ['password', 'token', 'secret', 'authorization', 'cookie', 'hash'];

const isSensitiveKey = (key = '') => {
    const lowered = String(key).toLowerCase();
    return SENSITIVE_KEYS.some(sensitive => lowered.includes(sensitive));
};

const inferLayerFromPath = (sourceFile) => {
    const normalized = sourceFile.split(path.sep).join('/').toLowerCase();

    if (normalized.includes('/routes/')) return 'Routes';
    if (normalized.includes('/controllers/')) return 'Controller';
    if (normalized.includes('/services/')) return 'Service';
    if (normalized.includes('/models/')) return 'Model';
    if (normalized.includes('/scripts/')) return 'Scripts';
    if (normalized.includes('/shared/')) return 'Shared';
    if (normalized.includes('/utils/')) return 'Utils';

    return 'UnknownLayer';
};

const inferFunctionFromStack = () => {
    const stack = new Error().stack || '';
    const lines = stack.split('\n').slice(2);

    for (const line of lines) {
        if (line.includes('logger.js')) continue;

        const withNameMatch = line.match(/at\s+([^\s(]+)\s+\(/);
        if (withNameMatch && withNameMatch[1]) {
            return withNameMatch[1].replace('Object.', '');
        }

        const anonymousMatch = line.match(/at\s+([^\s]+)$/);
        if (anonymousMatch && anonymousMatch[1]) {
            return anonymousMatch[1];
        }
    }

    return 'anonymous';
};

const formatContext = (context = {}) => {
    const safeContext = {};
    for (const [key, value] of Object.entries(context || {})) {
        safeContext[key] = isSensitiveKey(key) ? '[REDACTED]' : value;
    }

    const entries = Object.entries(safeContext).filter(([, value]) => value !== undefined);
    if (!entries.length) return '';
    return ` | ${entries.map(([key, value]) => `${key}=${value}`).join(' ')}`;
};

const formatLine = (level, meta, message, context) => {
    const { layer, file, fn } = meta;
    const emoji = LEVEL_EMOJI[level] || LEVEL_EMOJI.warn;
    return `${emoji} [${layer}] [${file}] [${fn}] ${message}${formatContext(context)}`;
};

const createLogger = (meta) => {
    if (!meta || !meta.layer || !meta.file || !meta.fn) {
        throw new Error('createLogger requer meta completa: { layer, file, fn }');
    }

    return {
        start: (message, context = {}) => console.log(formatLine('start', meta, message, context)),
        success: (message, context = {}) => console.log(formatLine('success', meta, message, context)),
        warn: (message, context = {}) => console.warn(formatLine('warn', meta, message, context)),
        error: (message, context = {}) => console.error(formatLine('error', meta, message, context))
    };
};

const loggerSnippet = (layer, file, fn) => createLogger({ layer, file, fn });

const getLogger = (sourceFile) => {
    const layer = inferLayerFromPath(sourceFile);
    const file = path.basename(sourceFile || 'unknown.js');

    const write = (level, message, context = {}) => {
        const fn = inferFunctionFromStack();
        const line = formatLine(level, { layer, file, fn }, message, context);

        if (level === 'error') {
            console.error(line);
            return;
        }
        if (level === 'warn') {
            console.warn(line);
            return;
        }
        console.log(line);
    };

    return {
        start: (message, context = {}) => write('start', message, context),
        success: (message, context = {}) => write('success', message, context),
        warn: (message, context = {}) => write('warn', message, context),
        error: (message, context = {}) => write('error', message, context)
    };
};

module.exports = {
    createLogger,
    loggerSnippet,
    getLogger
};
