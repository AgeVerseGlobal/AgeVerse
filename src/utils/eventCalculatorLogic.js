import {
  formatLocalizedDate,
  formatLocalizedWeekday,
} from "../utils/localizedDate";

export function calculateEvent(eventDate) {

  const now = new Date();

  const target = new Date(eventDate);

  const diff = target.getTime() - now.getTime();


  if(diff <= 0){

    return {
      status:"passed"
    };

  }


  const totalSeconds = Math.floor(diff / 1000);


  const days = Math.floor(
    totalSeconds / (60 * 60 * 24)
  );


  const hours = Math.floor(
    (totalSeconds % (60 * 60 * 24)) / (60 * 60)
  );


  const minutes = Math.floor(
    (totalSeconds % (60 * 60)) / 60
  );


  const seconds =
    totalSeconds % 60;



  return {

    status:"upcoming",

    days,

    hours,

    minutes,

    seconds,


    weekday: formatLocalizedWeekday(target),


    eventDate:
    formatLocalizedDate(target, {
      month: "long",
      day: "numeric",
      year: "numeric",
    })

  };


}