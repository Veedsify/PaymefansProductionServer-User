import React from "react";

const ProgressCircle = ({
  progress = 0,
  size = 36,
  strokeWidth = 1,
  bgColor = "text-gray-300",
  progressColor = "text-primary-dark-pink",
  checkColor = "text-primary-dark-pink",
  ...props
}) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg
      className="w-full h-full"
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      {...props}
    >
      <title>Progress: {progress}%</title>
      {/* Background circle */}
      <circle
        className={bgColor}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
      {/* Progress arc (always rendered, even at 0%) */}
      <circle
        className={progressColor}
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.4s ease" }}
      />
      {/* Optional: Show a start icon or similar when progress is 0 */}
      {progress === 0 && (
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={radius * 0.8}
          className="text-gray-400 fill-current"
        >
          {/* You can use a unicode icon, or just "0%" */}
          0%
        </text>
      )}
      {/* Checkmark when progress is 100 */}
      {progress === 100 && (
        <path
          className={checkColor}
          d={`
          M ${center - radius / 2.5} ${center}
          l ${radius / 3} ${radius / 3}
          l ${radius / 2} -${radius / 2}
        `}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth * 1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

export default ProgressCircle;
