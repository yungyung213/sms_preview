const receiverInput = document.getElementById("receiverInput");
const subjectInput = document.getElementById("subjectInput");
const messageInput = document.getElementById("messageInput");
const var1Input = document.getElementById("var1Input");
const var2Input = document.getElementById("var2Input");
const var3Input = document.getElementById("var3Input");
const dangerCheck = document.getElementById("dangerCheck");
const simulateToggle = document.getElementById("simulateToggle");

const iosReceiverText = document.getElementById("iosReceiverText");
const androidReceiverText = document.getElementById("androidReceiverText");
const iosPreview = document.getElementById("iosPreview");
const androidBubble = document.getElementById("androidBubble");
const androidContent = document.getElementById("androidContent");

const charCount = document.getElementById("charCount");
const iosTime = document.getElementById("iosTime");
const androidTime = document.getElementById("androidTime");
const subjectByteElement = document.getElementById("subjectByte");
const byteCounterWrapper = document.querySelector(".byte-counter");
const expandAndroidBtn = document.getElementById("expandAndroidBtn");
const copyInvisibleBtn = document.getElementById("copyInvisibleBtn");

function getByteLength(text) {
  let bytes = 0;

  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    bytes += code >> 11 ? 2 : 1;
  }

  return bytes;
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function updateReceiverName() {
  const name = receiverInput.value;
  const displayName = name.trim() === "" ? "수신자" : name;

  iosReceiverText.textContent = displayName;
  androidReceiverText.textContent = displayName;
}

function expandAndroid() {
  androidBubble.classList.add("expanded");
}

function applyVariables(subject, body) {
  let nextSubject = subject;
  let nextBody = body;

  [var1Input, var2Input, var3Input].forEach((input, index) => {
    const value = input.value;

    if (value) {
      const key = `{변수${index + 1}}`;
      nextSubject = nextSubject.split(key).join(value);
      nextBody = nextBody.split(key).join(value);
    }
  });

  return {
    subject: nextSubject,
    body: nextBody,
  };
}

function formatBodyForPreview(text) {
  if (dangerCheck.checked) {
    const invisibleChar = "\u3164";
    const replacement = '<span class="highlight-danger">■</span>';

    return escapeHtml(text)
      .replace(/\n/g, "<br>")
      .split(invisibleChar)
      .join(replacement);
  }

  return escapeHtml(text);
}

function updateMessagePreview() {
  const applied = applyVariables(subjectInput.value, messageInput.value);
  const rawSubject = applied.subject;
  const rawText = applied.body;

  const currentBytes = getByteLength(rawSubject);
  subjectByteElement.textContent = currentBytes;
  byteCounterWrapper.classList.toggle("over", currentBytes > 40);

  charCount.textContent = rawText.length;

  if (rawSubject.trim() === "" && rawText.trim() === "" && rawText.length === 0) {
    iosPreview.style.display = "none";
    androidBubble.style.display = "none";
    iosTime.style.display = "none";
    androidTime.style.display = "none";
    return;
  }

  iosPreview.style.display = "block";
  androidBubble.style.display = "flex";
  iosTime.style.display = "block";
  androidTime.style.display = "block";

  const formattedText = formatBodyForPreview(rawText);
  const displaySubject = rawSubject.trim() !== ""
    ? `<span class="msg-subject">${escapeHtml(rawSubject)}</span>`
    : "";

  iosPreview.innerHTML = displaySubject + formattedText;
  androidContent.innerHTML = displaySubject + formattedText;

  const isLongMessage = rawText.length > 200 || (rawText.match(/\n/g) || []).length > 8;

  if (simulateToggle.checked && isLongMessage) {
    androidBubble.classList.add("simulate-collapse");
    androidBubble.classList.remove("expanded");
  } else {
    androidBubble.classList.remove("simulate-collapse");
    androidBubble.classList.remove("expanded");
  }
}

async function copyInvisible() {
  const invisibleChar = "\u3164";

  try {
    await navigator.clipboard.writeText(invisibleChar);
    alert("✨ 투명 문자가 복사되었습니다!\n입력창에 붙여넣기(Ctrl+V) 하세요.");
    messageInput.focus();
  } catch (error) {
    const tempInput = document.createElement("textarea");
    tempInput.value = invisibleChar;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);

    alert("✨ 투명 문자가 복사되었습니다!\n입력창에 붙여넣기(Ctrl+V) 하세요.");
    messageInput.focus();
  }
}

[subjectInput, messageInput, var1Input, var2Input, var3Input].forEach((element) => {
  element.addEventListener("input", updateMessagePreview);
});

receiverInput.addEventListener("input", updateReceiverName);
dangerCheck.addEventListener("change", updateMessagePreview);
simulateToggle.addEventListener("change", updateMessagePreview);
expandAndroidBtn.addEventListener("click", expandAndroid);
copyInvisibleBtn.addEventListener("click", copyInvisible);

updateReceiverName();
updateMessagePreview();
