"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface TimeLeft {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: "03",
    hours: "12",
    minutes: "00",
    seconds: "00",
  });

  useEffect(() => {
    // Generate a target date that is always 3 days, 12 hours into the future from first load
    // in order to keep the mock countdown visually active.
    let targetTime = localStorage.getItem("tanvi_sale_target");
    let targetDate: Date;

    if (targetTime) {
      targetDate = new Date(parseInt(targetTime));
      // If the target date has passed, reset it to 3 days in the future
      if (targetDate.getTime() - new Date().getTime() < 0) {
        targetDate = new Date(new Date().getTime() + 3.5 * 24 * 60 * 60 * 1000);
        localStorage.setItem("tanvi_sale_target", targetDate.getTime().toString());
      }
    } else {
      targetDate = new Date(new Date().getTime() + 3.5 * 24 * 60 * 60 * 1000); // 3.5 days from now
      localStorage.setItem("tanvi_sale_target", targetDate.getTime().toString());
    }

    const calculateTimeLeft = () => {
      const difference = targetDate.getTime() - new Date().getTime();
      let newTimeLeft: TimeLeft = { days: "00", hours: "00", minutes: "00", seconds: "00" };

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        newTimeLeft = {
          days: days.toString().padStart(2, "0"),
          hours: hours.toString().padStart(2, "0"),
          minutes: minutes.toString().padStart(2, "0"),
          seconds: seconds.toString().padStart(2, "0"),
        };
      }

      setTimeLeft(newTimeLeft);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full max-w-4xl mx-auto rounded-3xl overflow-hidden glass p-8 md:p-12 text-center border border-primary/20 shadow-[0_20px_50px_rgba(0,0,0,0.6),_0_0_30px_rgba(107,33,168,0.15)]">
      {/* Visual background texture */}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-surface/30 to-accent/5 opacity-50 z-0 pointer-events-none" />
      
      {/* Topographic line details in SVG */}
      <div className="absolute inset-0 opacity-5 mix-blend-overlay z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-text-ivory via-transparent to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <span className="font-dm-sans text-xs tracking-[0.25em] uppercase text-accent font-semibold mb-3">
          Flash Sale Event
        </span>
        <h2 className="font-cormorant italic text-3xl md:text-5xl text-text-ivory mb-2 font-medium">
          Shop Your Favorite Picks Today
        </h2>
        <p className="font-dm-sans text-xs md:text-sm text-text-ivory/60 max-w-md mx-auto mb-8 leading-relaxed">
          Stunning accessories and memorable crystal gifts at up to 40% off. Time is ticking.
        </p>

        {/* Timer Circles */}
        <div className="flex justify-center items-center gap-4 md:gap-6 mb-10 select-none">
          {/* Days */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-primary/30 bg-surface/50 backdrop-blur-md flex flex-col justify-center items-center shadow-lg shadow-black/40">
              <span className="font-dm-sans text-xl md:text-2xl font-bold text-text-ivory">
                {timeLeft.days}
              </span>
            </div>
            <span className="text-[10px] tracking-wider uppercase text-text-ivory/50 mt-2 font-medium">
              Days
            </span>
          </div>

          <span className="font-cormorant text-2xl text-accent/50 -mt-6 hidden sm:inline">:</span>

          {/* Hours */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-primary/30 bg-surface/50 backdrop-blur-md flex flex-col justify-center items-center shadow-lg shadow-black/40">
              <span className="font-dm-sans text-xl md:text-2xl font-bold text-text-ivory">
                {timeLeft.hours}
              </span>
            </div>
            <span className="text-[10px] tracking-wider uppercase text-text-ivory/50 mt-2 font-medium">
              Hours
            </span>
          </div>

          <span className="font-cormorant text-2xl text-accent/50 -mt-6 hidden sm:inline">:</span>

          {/* Minutes */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-primary/30 bg-surface/50 backdrop-blur-md flex flex-col justify-center items-center shadow-lg shadow-black/40">
              <span className="font-dm-sans text-xl md:text-2xl font-bold text-text-ivory">
                {timeLeft.minutes}
              </span>
            </div>
            <span className="text-[10px] tracking-wider uppercase text-text-ivory/50 mt-2 font-medium">
              Minutes
            </span>
          </div>

          <span className="font-cormorant text-2xl text-accent/50 -mt-6 hidden sm:inline">:</span>

          {/* Seconds */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-accent/40 bg-surface/50 backdrop-blur-md flex flex-col justify-center items-center shadow-lg shadow-black/40 shadow-accent/5">
              <span className="font-dm-sans text-xl md:text-2xl font-bold text-accent">
                {timeLeft.seconds}
              </span>
            </div>
            <span className="text-[10px] tracking-wider uppercase text-accent/70 mt-2 font-medium">
              Seconds
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <Link
          href="/collections"
          className="px-8 py-3.5 bg-gradient-to-r from-accent via-amber-500 to-accent hover:shadow-[0_0_20px_rgba(212,175,122,0.4)] rounded-full text-background-dark font-dm-sans text-xs tracking-widest uppercase font-bold border border-accent/20 transition-all duration-300 hover:scale-[1.03] cursor-pointer"
        >
          Shop the Sale
        </Link>
      </div>
    </div>
  );
}
