import { type InputHTMLAttributes } from "react";

// On étend les props d'un input HTML classique
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string; // pour ajouter tes styles personnalisés
}

function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      className={`${className}`}
    />
  );
}

export default Input;
