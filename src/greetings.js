const GREETINGS = [
  "Hello sir!",
  "Good day sir!",
  "Hello Master!",
  "Hey Mr. Saboo!",
  "Hello, creator!",
  "Hope you're doing well Mr. Saboo.",
  "Master.",
];

exports.generateGreeting = () => {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
};
