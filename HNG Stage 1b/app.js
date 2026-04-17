/**
 * Stage 1B HNG Cohort — Profile Card
 * Live time updating script
 */

document.addEventListener("DOMContentLoaded", () => {
    const timeElement = document.querySelector('[data-testid="test-user-time"]');
  
    if (timeElement) {
      function updateTime() {
        const now = Date.now();
        timeElement.textContent = now;
      }
      
      // Update immediately on render
      updateTime();
      
      // Update every 100ms to stay incredibly accurate
      setInterval(updateTime, 100);
    }
  });
