let secret = 0;
let nGuesses = 0;
let nMaxGuesses = 0;
let revealed = false;

let guessHistory = [];

let secretMin = null;
let secretMax = null;
let guessInput = null;

const stage = new _Stage();

const addScenes = () => {
  stage.addScene(
    new _Scene("game", "#gamePanel", "", [$("#gamePanel button")])
  );
  stage.addScene(
    new _Scene("options", "#optionsPanel", "#btnOptions", [
      $("#optionsPanel button"),
      $("#optionsPanel input")
    ])
  );
  stage.addScene(new _Scene("help", "#helpPanel", "#btnHelp", []));

  stage.setDefault("game");
};

addScenes();

const handleKeyup = (e) => {
  switch (e.code) {
    case "Enter":
      $("#btnGuess").click();
      break;

    case "NumpadEnter":
      $("#btnGuess").click();
      break;

    case "KeyH":
      e.preventDefault();
      $("#btnHelp").click();
      break;

    case "KeyG":
      e.preventDefault();
      $("#btnGuess").click();
      break;

    case "KeyZ":
      e.preventDefault();
      $("#btnReset").click();
      break;

    case "KeyN":
      e.preventDefault();
      $("#btnNew").click();
      break;
  }
};

const toggleControl = (control, enable) => {
  control.prop("wasEnabled", isControlEnabled(control));
  control.prop("disabled", !enable);
};

const restoreControl = (control) => {
  control.prop("disabled", !wasControlEnabled(control));
};

const isControlEnabled = (control) => {
  return !control.prop("disabled");
};

const wasControlEnabled = (control) => {
  return control.prop("wasEnabled");
};

const toggleWord = (holder, hider, show) => {
  if (show) {
    holder.removeClass("hide");
    hider.addClass("hide");
  } else {
    holder.addClass("hide");
    hider.removeClass("hide");
  }
};

const toggleTextHolder = (holder, hider) => {
  // If Reveal is enabled, it means we're showing Next
  if (isControlEnabled($("#btnReveal"))) {
    if (optTextPromptNext.value()) {
      toggleWord(holder, hider, true);
    } else {
      toggleWord(holder, hider, false);
    }

    // Otherwise we're showing Reveal
  } else {
    if (optTextPromptReveal.value()) {
      toggleWord(holder, hider, true);
    } else {
      toggleWord(holder, hider, false);
    }
  }
};

const toggleTextPrompt = () => {
  toggleTextHolder($("#word"), $("#wordHider"));
};

const toggleTextAnswer = () => {
  toggleTextHolder($("#translation"), $("#translationHider"));
};

const canGuess = () => {
  if (nGuesses >= nMaxGuesses) {
    return false;
  }

  if (revealed) {
    return false;
  }

  if (isNaN(guessInput.value())) {
    return false;
  }

  if (guessInput.value() < guessInput.min()) {
    return false;
  }

  if (guessInput.value() > guessInput.max()) {
    return false;
  }

  return true;
};

const canNew = () => {
  // return (nGuesses > 0);
  return true; // because why not get a new random number anyway
};

const guess = () => {
  if (stage.hiding("game") || !canGuess()) {
    $("#guessInput").focus();
    return;
  }

  updateGuessCount(nGuesses + 1);

  let guess_ = guessInput.value();
  $("#mostRecentGuess").html(makeMostRecentGuess(guess_));

  if (guess_ === secret || nGuesses >= nMaxGuesses) {
    moveMostRecentGuess();
    $("#mostRecentGuess").html(makeWinLoseResult(guess_ === secret));
  } else {
    copyMostRecentGuess();
  }

  $("#guessInput").focus();
  guessInput.value("");
  toggleAllControls();
};

const copyMostRecentGuess = () => {
  $("#mostRecentGuess").find(".guessPast").clone().appendTo($("#guessHistory"));
};

const moveMostRecentGuess = () => {
  $("#mostRecentGuess")
    .find(".guessPast")
    .detach()
    .appendTo($("#guessHistory"));
};

const makeMostRecentGuess = (value) => {
  let cl, title, iconCl;
  if (value > secret) {
    cl = "guessHigh";
    title = `${value} is too high`;
    iconCl = `fa-angles-down`;
  } else if (value < secret) {
    cl = "guessLow";
    title = `${value} is too low`;
    iconCl = `fa-angles-up`;
  } else {
    cl = "guessRight";
    title = `${value} was the secret number`;
    iconCl = `fa-circle-check`;
  }
  let html = `<div class="guessPast ${cl}" title="${title}">${value}<i class="fa ${iconCl}"></i></div>`;
  return html;
};

const makeWinLoseResult = won => {
  let cl, titleWord, iconCl;
  if (won) {
    cl = "guessWon";
    titleWord = 'won';
    iconCl = `fa-circle-check`;
  } else {
    cl = "guessLost";
    titleWord = 'lost';
    iconCl = `fa-circle-xmark`;
  }
  
  let title = `You ${titleWord}! The secret number was ${secret}.`;  
  let html = `<div class="guessPast ${cl}" title="${title}">${secret}<i class="fa ${iconCl}"></i></div>`;
  return html;
}

const toggleAllControls = () => {
  toggleControl($("#btnGuess"), canGuess());
  toggleControl($("#btnNew"), canNew());
};

const updateGuessCount = (n) => {
  nGuesses = n;
  $("#nGuesses").text(nGuesses);
};

const setDefaultOptionValues = () => {
  secretMin.min(-9999);
  secretMin.max(99);
  secretMin.value(1);

  secretMax.max(9999);
  secretMax.min(2);
  secretMax.value(100);

  guessInput.min(1);
  guessInput.max(100);
  guessInput.value("");
};

const createDynamicOptions = () => {
  secretMin = new OptionSpinner($("#secretMin"));
  secretMax = new OptionSpinner($("#secretMax"));
  guessInput = new OptionSpinner($("#guessInput"));
};

const chooseSecret = () => {
  let min = secretMin.value();
  let max = secretMax.value();
  secret = Math.floor(Math.random() * (max - min)) + min;
};

const chooseMaxGuesses = () => {
  let range = secretMax.value() - secretMin.value();
  nMaxGuesses = Math.max(1, Math.ceil(Math.log(range) / Math.log(2))); // - 1);
  $("#nMaxGuesses").text(nMaxGuesses);
};

const preChangeMin = () => {
  guessInput.min(secretMin.value());
  secretMax.min(secretMin.value() + 1);
  if (secretMax.value() < secretMax.min()) {
    secretMax.value(secretMax.min());
  }
  chooseMaxGuesses();  
}

const preChangeMax = () => {
  guessInput.max(secretMax.value());
  secretMin.max(secretMax.value() - 1);
  if (secretMin.value() > secretMin.max()) {
    secretMin.value(secretMin.max());
  }
  chooseMaxGuesses();  
}

const changeMin = () => {
  preChangeMin();
  new_();
};

const changeMax = () => {
  preChangeMax();
  new_();
};

const changeGuess = () => {
  toggleControl($("#btnGuess"), canGuess());
};

const new_ = () => {
  if (stage.hiding("game") || !canNew()) {
    return;
  }

  updateGuessCount(0);
  
  guessInput.value("");
  toggleAllControls();
  chooseSecret();

  $("#guessHistory").html("");
  $("#mostRecentGuess").html("");
  $("#mostRecentGuess").append(`<div class='guessPast'>?</div>`);
};

const reset = () => {
  setDefaultOptionValues();
  chooseMaxGuesses();
  new_();
};

const bind = () => {
  secretMin.on("keydown ", preChangeMin);
  secretMax.on("keydown", preChangeMax);
  secretMin.on("keyup change", changeMin);
  secretMax.on("keyup change", changeMax);
  guessInput.on("keydown keyup change", changeGuess);

  $("#btnHelp").click(() => {
    stage.toggle("help");
  });
  $("#btnGuess").click(guess);
  $("#btnReset").click(reset);
  $("#btnNew").click(() => {
    new_();
    $('#guessInput').focus();
  });

  $(document).keyup(handleKeyup);
};

const initialize = () => {
  createDynamicOptions();
  bind();
  stage.show("game");
  reset();
  // $('#guessInput').focus(); // NB Horrible for developing
};

$(document).ready(initialize);