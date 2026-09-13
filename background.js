chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "check",
    title: "check",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "check") {
    return;
  }

  const text = info.selectionText || "";

  let chinese = 0;
  let english = 0;
  let punctuation = 0;
  let number = 0;
  let excluded = 0;

  for (const char of text) {
    if (/\s/.test(char)) {
      excluded++;
    } else if (/[一-鿿]/.test(char)) {
      chinese++;
    } else if (/[a-zA-Z]/.test(char)) {
      english++;
    } else if (/[0-9]/.test(char)) {
      number++;
    } else if (/[^\w]/.test(char)) {
      punctuation++;
    }
  }

  const total = chinese + english + punctuation + number;

  await chrome.scripting.executeScript({
    target: {
      tabId: tab.id
    },
    func: (data) => {
      const old = document.getElementById("check-result-box");
      if (old) {
        old.remove();
      }

      const box = document.createElement("div");
      box.id = "check-result-box";

      box.innerHTML = 
        "Check<br><br>" +
        "总计：" + data.total + "<br><br>" +
        "中文：" + data.chinese + "<br>" +
        "英文：" + data.english + "<br>" +
        "标点：" + data.punctuation + "<br>" +
        "数字：" + data.number + "<br>" +
        "排除格式符：" + data.excluded;

      box.style.position = "fixed";
      box.style.right = "20px";
      box.style.bottom = "20px";
      box.style.zIndex = "999999";
      box.style.padding = "15px 25px";
      box.style.background = "#333";
      box.style.color = "#fff";
      box.style.borderRadius = "8px";
      box.style.fontSize = "16px";
      box.style.lineHeight = "1.6";
      box.style.boxShadow = "0 2px 10px rgba(0,0,0,.3)";

      document.body.appendChild(box);

      setTimeout(() => {
        box.remove();
      }, 5000);
    },
    args: [{
      total,
      chinese,
      english,
      punctuation,
      number,
      excluded
    }]
  });
});
