import { AllModelsProps } from "@/features/user/types/user";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { motion } from "framer-motion";

const ModelsSubscription = ({ model }: { model: any }) => {
  const memoizedModelSubscription = useMemo(() => {
    return (
      <motion.div
        className="flex flex-col items-center select-none gap-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href={`/${model?.username}`}>
          <motion.div whileHover={{ scale: 1.1 }}>
            <Image
              width={100}
              height={100}
              priority
              src={model?.profile_image}
              alt={model ? model.fullname : ""}
              className="object-cover w-20 h-20 rounded-full lg:w-24 lg:h-24 aspect-square"
            />
          </motion.div>
        </Link>
        <motion.p
          className="text-sm font-bold text-center dark:text-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {model?.username}
        </motion.p>
        <motion.div
          className="text-sm text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="block text-xs text-center text-slate-500 dark:text-slate-200">
            Monthly
          </span>
        </motion.div>
        <motion.button
          className="block w-full px-3 py-1 text-xs font-semibold text-white cursor-pointer rounded-md bg-primary-dark-pink"
          whileHover={{ scale: 1.05, backgroundColor: "#e91e63" }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Subscribe
        </motion.button>
      </motion.div>
    );
  }, [model]);

  return memoizedModelSubscription;
};

export default ModelsSubscription;
