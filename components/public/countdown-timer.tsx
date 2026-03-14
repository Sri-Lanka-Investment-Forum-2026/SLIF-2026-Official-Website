"use client";

import { useEffect, useState } from "react";

type CountdownTimerProps = {
  targetDate: string;
};

type CountdownState = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const zeroState: CountdownState = {
  days: "00",
  hours: "00",
  minutes: "00",
  seconds: "00",
};

function formatUnit(value: number) {
  return String(Math.max(0, value)).padStart(2, "0");
}

function getCountdownState(targetDate: string): CountdownState {
  const distance = new Date(targetDate).getTime() - Date.now();

  if (Number.isNaN(distance) || distance <= 0) {
    return zeroState;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  return {
    days: formatUnit(days),
    hours: formatUnit(hours),
    minutes: formatUnit(minutes),
    seconds: formatUnit(seconds),
  };
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<CountdownState>(zeroState);

  useEffect(() => {
    setCountdown(getCountdownState(targetDate));

    const intervalId = window.setInterval(() => {
      setCountdown(getCountdownState(targetDate));
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [targetDate]);

  return (
    <div className="countdown d-flex justify-content-start" aria-label="Event countdown">
      <div>
        <h3>{countdown.days}</h3>
        <h4>Days</h4>
      </div>
      <div>
        <h3>{countdown.hours}</h3>
        <h4>Hours</h4>
      </div>
      <div>
        <h3>{countdown.minutes}</h3>
        <h4>Minutes</h4>
      </div>
      <div>
        <h3>{countdown.seconds}</h3>
        <h4>Seconds</h4>
      </div>
    </div>
  );
}
