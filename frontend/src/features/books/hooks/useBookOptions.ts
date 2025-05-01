import { useState, useEffect } from "react";
import { AreaCode, SubareaCode } from "../types/book";

const API_URL = '/api';

export default function useBookOptions(onError?: (error: Error) => void) {
  const [areaCodes, setAreaCodes] = useState<AreaCode>({});
  const [subareaCodes, setSubareaCodes] = useState<SubareaCode>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    fetch(`${API_URL}/books/options`)
      .then(res => res.json())
      .then(data => {
        setAreaCodes(data.areaCodes || {});
        setSubareaCodes(data.subareaCodes || {});
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching options:", error);
        if (onError) onError(new Error("Falha ao carregar opções. Tente novamente."));
        setIsLoading(false);
      });
  }, [onError]);

  return { areaCodes, subareaCodes, isLoading };
}