function randomSelection(obj: any) {
  return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
}

export default randomSelection;
