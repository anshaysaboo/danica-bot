const GREETINGS = [
  "Hello sir!",
  "Good day sir!",
  "Hello Master!",
  "Hey Mr. Saboo!",
  "Hello, creator!",
  "Howdy there sir!",
  "Howdy there Mr. Saboo!",
  "Hope you're doing well Mr. Saboo.",
];

exports.generateGreeting = () => {
  return GREETINGS[Math.floor(Math.random() * GREETINGS.length)];
};
