// Get all mood buttons
const moodButtons = document.querySelectorAll('.moodButton');

// Add mouseenter and mouseleave event listeners to each button
moodButtons.forEach(button => {
  button.addEventListener('mouseenter', () => {
    animateEmoji(button);
  });

  button.addEventListener('mouseleave', () => {
    resetEmoji(button);
  });
});

// Function to animate the emoji
function animateEmoji(button) {
  const originalEmoji = button.textContent; // Get the original emoji
  const animatedEmoji = originalEmoji.repeat(3); // Example: Repeat emoji three times for animation

  button.textContent = animatedEmoji; // Update button text with animated emoji
}

// Function to reset the emoji to original state
function resetEmoji(button) {
  const originalEmoji = button.getAttribute('data-mood'); // Get the original emoji from data attribute
  button.textContent = originalEmoji; // Reset button text to original emoji
}

