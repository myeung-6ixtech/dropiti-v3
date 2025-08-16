import React, { FC, ReactNode, FormEvent } from "react";
import { formStyles } from "@/styles/index";

interface FormProps {
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  className?: string;
}

const Form: FC<FormProps> = ({ onSubmit, children, className }) => {
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault(); // Prevent default form submission
        onSubmit(event);
      }}
      className={`${formStyles.container} ${className || ''}`} // Use centralized styles with optional additional classes
    >
      {children}
    </form>
  );
};

export default Form;
