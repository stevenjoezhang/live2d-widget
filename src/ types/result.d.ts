interface Result {
  message: {
    default: string[];
    console: string;
    copy: string;
    visibilitychange: string;
  };
  time: Time;
  mouseover: {
    selector: string;
    text: string | string[];
  }[];
  click: {
    selector: string;
    text: string | string[];
  }[];
  seasons: {
    date: string;
    text: string | string[];
  }[];
}
