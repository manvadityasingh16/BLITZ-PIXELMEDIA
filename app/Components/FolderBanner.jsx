'use client'
import React from 'react'
import { easeInOut, motion } from "motion/react"

const FolderBanner = () => {
    return (
        <motion.div
            initial={{
                y: -100,
            }}
            animate={{
                y: 0,
            }}
            transition={{
                duration: 1,
                ease: "easeInOut",
            }}
            className='flex flex-col items-center justify-center absolute top-0 inset-x-0 z-10'>
            <svg width="320" height="35" viewBox="0 0 320 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M320 0C320 0 303.5 -2.53785e-06 295.5 7.5C288.29 14.2595 287.5 20.5059 280 27.5059C273.437 33.6307 259.219 34.7745 255.767 34.9648L255 35H65C65 35 47.5001 34.5057 40 27.5059C32.5 20.5059 31.7101 14.2595 24.5 7.5C16.5 -4.06056e-06 0 0 0 0H320Z" fill="#353535" />
            </svg>


            <div className='flex items-center justify-center gap-2 absolute top-0 inset-x-0 mt-2'>

                <div className='flex flex-col justify-center items-center'>

                    <div className='h-1.5 w-1.5 bg-green-500 rounded-full z-10'></div>
                    <motion.div
                        initial={{
                            scale: 0.5,
                            opacity: 0       
                        }}
                        animate={{
                            scale: 2.5,
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            repeat: Infinity,
                            duration: 2,     
                            ease: "easeOut",
                            times: [0, 0.2, 1] 
                        }}
                        className='absolute h-2 w-2 bg-green-500 rounded-full'></motion.div>
                </div>
                <p className='text-sm text-white tracking-tight'>Available For New Projects!</p>
            </div>

        </motion.div>
    )
}

export default FolderBanner