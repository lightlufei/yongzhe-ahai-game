(() => {
  const SKIN_KEY = "naiwa-skin-v1";
  const PROFILE_KEY = "naiwa-profile-v1";
  const DEFAULT_SKIN = "persona-cartoon";
  const portraits = {
    classic: "./assets/characters/hero.webp",
    "persona-cartoon": "./assets/characters/persona.webp",
  };
  const names = {
    classic: "奶蛙勇者",
    "persona-cartoon": "卡通勇者",
  };

  const picker = document.querySelector("#persona-picker");
  const options = [...document.querySelectorAll("[data-persona-skin]")];
  const saveNote = document.querySelector("#persona-save-note");

  function readProfile() {
    try {
      return JSON.parse(localStorage.getItem(PROFILE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  function currentSkin() {
    try {
      const direct = localStorage.getItem(SKIN_KEY);
      if (direct && portraits[direct]) return direct;
      const profile = readProfile();
      if (profile.skinId && portraits[profile.skinId]) return profile.skinId;
    } catch {
      // The game still has its original skin if storage is unavailable.
    }
    return DEFAULT_SKIN;
  }

  function persistSkin(skinId) {
    try {
      localStorage.setItem(SKIN_KEY, skinId);
      localStorage.setItem(
        PROFILE_KEY,
        JSON.stringify({
          ...readProfile(),
          skinId,
          updatedAt: new Date().toISOString(),
        }),
      );
      saveNote.textContent = `已保存 skinId: ${skinId}`;
    } catch {
      saveNote.textContent = "本机存储不可用，重新打开后会恢复默认皮肤";
    }
  }

  function syncOptions() {
    const skinId = currentSkin();
    options.forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.personaSkin === skinId),
      );
    });
    const avatar = document.querySelector(".hero-panel .avatar img");
    const portrait = portraits[skinId] || portraits[DEFAULT_SKIN];
    if (avatar && avatar.getAttribute("src") !== portrait) {
      avatar.src = portrait;
    }
    const name = document.querySelector(".hero-panel .hero-line b");
    const displayName = names[skinId] || names[DEFAULT_SKIN];
    if (name && name.textContent !== displayName) {
      name.textContent = displayName;
    }
  }

  options.forEach((button) => {
    button.addEventListener("click", () => {
      const skinId = button.dataset.personaSkin;
      if (!skinId || skinId === currentSkin()) return;
      persistSkin(skinId);
      button.disabled = true;
      window.setTimeout(() => location.reload(), 140);
    });
  });

  if (!localStorage.getItem(SKIN_KEY)) persistSkin(DEFAULT_SKIN);
  syncOptions();
  window.setTimeout(() => {
    if (picker) picker.hidden = false;
    syncOptions();
  }, 450);

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest("#start-button, #continue-button")) {
      if (picker) picker.hidden = true;
      window.setTimeout(syncOptions, 1600);
      return;
    }
    if (
      target.closest('[data-action="home"], #cancel-new-run')
    ) {
      window.setTimeout(() => {
        if (picker) picker.hidden = false;
        syncOptions();
      }, 900);
    }
  });
})();
