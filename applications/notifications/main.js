// function notify(){
//     Notification.requestPermission().then(permission => {
//         if (permission === 'granted') {
//             navigator.serviceWorker.register('service-worker.js').then(registration => {
//                 console.log('Service Worker registered with scope:', registration.scope);
//                 scheduleNotification();
//             }).catch(error => {
//                 console.error('Service Worker registration failed:', error);
//             });
//         }
//     });
// }

// notify()

// function scheduleNotification() {
//     if ('serviceWorker' in navigator && 'PushManager' in window) {
//         navigator.serviceWorker.ready.then(registration => {
//             setInterval(() => {
//                 schedules = getSchedulesFromLocalStorage();
  
//                 schedules.forEach(schedule => {
//                     const [hours, minutes, period] = schedule.time_of_day.match(/(\d+):(\d+)/i).slice(1);
//                     let hours24 = parseInt(hours, 10);
                
//                     const eventTime = new Date();
//                     eventTime.setHours(hours24, parseInt(minutes, 10), 0, 0);
                
//                     const currentTime = new Date();
                
//                     if (currentTime.getDay() === schedule.day_of_week) {
//                       const timeDifference = Math.abs(eventTime - currentTime);
                     
                
//                       // Check if the time difference is within a 5-minute range
//                       const fiveMinutes = 2 * 60 * 1000;
//                       if (timeDifference <= fiveMinutes) {
//                         registration.showNotification('Mood Survey Reminder', {
//                             body: `It's time to take your Mood survey!`,
//                             tag: 'periodic-notification',
//                             icon: 'path/to/your/icon.png',
                            
//                         });
//                       }
//                     }
//                   });
//             }, 2 * 60 * 100); // 20 minutes in milliseconds
//         });
//     }
// }


// function getSchedulesFromLocalStorage() {
//     const schedules = localStorage.getItem('schedules');
//     return schedules ? JSON.parse(schedules) : [];
//   }