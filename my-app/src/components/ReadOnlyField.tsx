"use client";

import React from "react";

type Props = {
  label: string;
  value: string;
  containerClass?: string;
  inputClass?: string;
};

export default function ReadOnlyField({ label, value, containerClass = "", inputClass = "" }: Props) {
  return (
    <div className={containerClass}>
      <label>{label}</label>
      <input type="text" value={value} readOnly className={inputClass} />
    </div>
  );
}
