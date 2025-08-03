import React from "react";
import { createPortal } from "react-dom";

interface ModalPortalProps {
  children: React.ReactNode;
}

const ModalPortal: React.FC<ModalPortalProps> = ({ children }) => {
  const modalRoot = document.getElementById("modal-root");

  if (!modalRoot) {
    console.error("Modal root element not found");
    return null;
  }

  return createPortal(children, modalRoot);
};

export default ModalPortal;
