import { useState } from "react";
import useBookOptions from "./useBookOptions";

export default function useAreaSelection(onError?: (e: Error) => void) {
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const { areaCodes, subareaCodes } = useBookOptions(onError);
  return { category, setCategory, subcategory, setSubcategory, areaCodes, subareaCodes };
}