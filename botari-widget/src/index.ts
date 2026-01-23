export function initWidget() {
  const chatBox = document.createElement("div");
  chatBox.innerText = "Botari Chat Widget Ready!";
  chatBox.style.position = "fixed";
  chatBox.style.bottom = "20px";
  chatBox.style.right = "20px";
  chatBox.style.padding = "10px";
  chatBox.style.background = "#4CAF50";
  chatBox.style.color = "white";
  document.body.appendChild(chatBox);
}
