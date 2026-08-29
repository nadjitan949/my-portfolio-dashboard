import { forwardRef, type InputHTMLAttributes } from "react";

// On étend les props d'un input HTML classique
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string; // pour ajouter tes styles personnalisés
}

// ✅ Utiliser forwardRef pour permettre la prop ref
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        className={`${className}`}
      />
    );
  }
);

// ✅ Important : Ajouter un displayName pour le débogage
Input.displayName = 'Input';

export default Input;