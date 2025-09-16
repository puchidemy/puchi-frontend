"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, Star, Trophy } from "lucide-react";
import Image from "next/image";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useDrawerStore } from "@/store/drawer";

export const DrawerCustom = () => {
  const { isOpen, result, closeDrawer } = useDrawerStore();

  if (!result) return null;

  const { isCorrect, message, explanation, score } = result;

  return (
    <Drawer open={isOpen} onOpenChange={closeDrawer}>
      <DrawerContent className="max-h-[80vh] max-w-screen-lg px-4 mx-auto">
        <Image
          alt="Panda drawer"
          src="/images/panda/panda-drawer.png"
          width={200}
          height={200}
          className="absolute -top-[86px] left-4 lg:left-10"
        />
        <DrawerHeader className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="flex justify-center mb-4"
          >
            {isCorrect ? (
              <div className="relative">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
                  className="absolute -top-1 -right-1"
                >
                  <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                </motion.div>
              </div>
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </motion.div>

          <DrawerTitle className="text-xl font-bold">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {message}
            </motion.div>
          </DrawerTitle>

          {explanation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2"
            >
              <DrawerDescription className="text-sm text-muted-foreground">
                {explanation}
              </DrawerDescription>
            </motion.div>
          )}

          {score && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center gap-2 mt-4"
            >
              <Trophy className="h-5 w-5 text-yellow-500" />
              <span className="text-lg font-bold text-yellow-600">
                +{score} points
              </span>
            </motion.div>
          )}
        </DrawerHeader>

        <DrawerFooter>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={closeDrawer}
              className="w-full"
              variant={isCorrect ? "default" : "secondary"}
            >
              Continue
            </Button>
          </motion.div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
