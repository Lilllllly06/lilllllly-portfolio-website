
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PawPrint } from "lucide-react";
import { motion } from "framer-motion";

interface WelcomeDialogProps {
  open: boolean;
  onClose: () => void;
}

const WelcomeDialog = ({ open, onClose }: WelcomeDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md border-2 border-navy/20 bg-gradient-to-br from-blue-50 to-purple-50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl text-navy flex items-center justify-center gap-2">
            <PawPrint className="h-6 w-6 text-navy" />
            <span>Woof! You found me!</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center pt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              Welcome to my hooman's portfolio! 🐶
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-2 text-navy-light"
            >
              There are <span className="font-bold">4 easter eggs</span> hidden throughout this site, in addition to my hooman's amazing projects and resume!
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-sm text-navy-light/80 italic"
            >
              Can you find them all? Sniff around and have fun exploring!
            </motion.div>
            
            <motion.div 
              className="mt-6 flex justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.9, type: "spring" }}
            >
              <div className="relative">
                <div className="text-4xl">🐾</div>
                <div className="absolute -right-4 -top-4 text-3xl animate-pulse">💭</div>
              </div>
            </motion.div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction className="bg-navy hover:bg-navy-dark">
            Let's explore!
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default WelcomeDialog;
