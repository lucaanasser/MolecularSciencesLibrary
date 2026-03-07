import * as React from "react";
import { Link } from "react-router-dom";
import { FieldConfig, useHighlightMatch } from "..";

export default function ResultItem({ result, fields, searchQuery }: {
  result: Record<string, any>;
  fields: FieldConfig[];
  searchQuery?: string;
}) {
  const { highlightAllInNode } = useHighlightMatch();

  // Separa os campos
  const mainFields = fields.filter(field => field.type === "main");
  const otherFields = fields.filter(field => field.type !== "main");

  const renderField = (field: FieldConfig) => {
    const value = result[field.key];
    const rendered = field.render ? field.render(value) : value;
    if (rendered === undefined || rendered === null) return null;

    let className = field.className;
    if (!className) {
      if (field.type === "main") { className = "prose-md text-[#1A0DAB]"; }
      else if (field.type === "secondary" || !field.type) { className = "text-[#006621]"; }
    }

    const isLink = field.type === "main" && field.linkTo;
    const Component = isLink ? Link : "span";
    const componentProps: any = {
      className: `${className} ${isLink ? "hover:underline visited:text-[#681da8]" : ""}`,
    };
    if (isLink) componentProps.to = field.linkTo(result);

    return (
      <Component key={field.key} {...componentProps}>
        {rendered}
      </Component>
    );
  };

  const renderFieldsWithSeparator = (fieldsArr: FieldConfig[]) => {
  return fieldsArr.map((field, idx) => (
    <React.Fragment key={field.key}>
      {renderField(field)}
      {idx < fieldsArr.length - 1 && renderField(fieldsArr[idx + 1]) !== null && (
        <span className="mx-2 text-gray-400">
          {field.type === "main" && "-"}
          {field.type !== "main" && "•"}
        </span>
      )}
    </React.Fragment>
  ));
};

const content = (
  <div className="pb-4 border-b border-gray-200 last:border-0 flex flex-col gap-2">
    <div className="flex flex-wrap gap-1 items-center">
      {renderFieldsWithSeparator(mainFields)}
    </div>
    <div className="flex flex-wrap gap-1 items-center">
      {renderFieldsWithSeparator(otherFields)}
    </div>
  </div>
);

  return highlightAllInNode(content, searchQuery || "");
}