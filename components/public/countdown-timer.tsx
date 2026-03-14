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

const countdownUnits = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

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

  const accessibleLabel = `${countdown.days} days, ${countdown.hours} hours, ${countdown.minutes} minutes, and ${countdown.seconds} seconds until the event starts`;

  return (
    <div
      className="countdown d-flex justify-content-start"
      role="timer"
      aria-live="off"
      aria-atomic="true"
      aria-label={accessibleLabel}
    >
      {countdownUnits.map((unit) => (
        <div key={unit.key}>
          <h3>{countdown[unit.key]}</h3>
          <h4>{unit.label}</h4>
        </div>
      ))}
    </div>
  );
}
