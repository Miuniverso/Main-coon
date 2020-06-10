var questions = document.querySelector(".question");

console.log(questions.length);

for (var i = 0; i < questions.length; i++) {
  var item = questions[i];
  var answer = item.querySelector(".question__link");
  answer.addEventListener('click', function () {
    answer.classList.toggle("question__link--open")
    questions[i].querySelector(".question__answer").classList.toggle("visually-hidden");
  });
}
