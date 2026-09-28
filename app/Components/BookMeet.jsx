'use client'

import React from 'react'
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";

const BookMeet = () => {

    // useEffect(() => {
    //     (async function () {
    //         const cal = await getCalApi({ "namespace": "30min" });
    //         cal("ui", { "theme": "light", "hideEventTypeDetails": false, "layout": "month_view" });
    //     })();
    // }, [])

    useEffect(() => {
        (async function () {
            const cal = await getCalApi({ "namespace": "15min" });
            cal("ui", { "theme": "light", "hideEventTypeDetails": false, "layout": "month_view" });
        })();
    }, [])

    return (
        <section
            id='bookACall'
            className='relative min-h-screen w-full flex pt-40'
        >
            <div className='container mx-auto w-full flex flex-col  items-center z-20 pointer-events-auto'>
                <h1 className='text-4xl md:text-7xl font-canela text-accent max-w-[70%] text-center text-3xl lg:text-7xl font-light tracking-tight'>
                    Book a <span className='text-orangish-red font-canela text-3xl lg:text-7xl font-light tracking-tight'> 15-min call </span>
                </h1>

                <div className='text-center px-2 text-md md:text-xl flex flex-col gap-2 mt-6'>
                    <p>Please select the time that fits you or just</p>
                    <p>Email us at &nbsp;
                        <a href="mailto:connect@blitzpixelmedia.com" className='underline font-semibold text-orangish-red hover:text-neutral-600 '>connect@blitzpixelmedia.com</a>
                    </p>
                </div>

                <div className='mt-20 w-full'>
                    {/* <Cal namespace="30min"
                        calLink="graphicmoron/30min"
                        style={{ width: "100%", height: "100%", overflow: "scroll", borderRadius: "1.2rem" }}
                        config={{ "layout": "month_view", "theme": "light" }}
                    /> */}
                    <Cal namespace="15min"
                        calLink="blitz-pixelmedia/15min"
                        style={{ width: "100%", height: "100%", overflow: "scroll", borderRadius: "1.2rem" }}
                        config={{ "layout": "month_view","theme": "dark" , "useSlotsViewOnSmallScreen": "true" }}
                    />
                </div>


            </div>
        </section>
    )
};


export default BookMeet