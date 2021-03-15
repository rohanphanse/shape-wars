document.addEventListener("DOMContentLoaded", () => {
    const game = new Game() 
    game.start()

    // Elements
    const pauseButton = document.getElementById("pause-button")
    const pauseIcon = document.getElementById("pause-icon")
    const newGameButton = document.getElementById("new-game-button")

    pauseButton.addEventListener("click", pause)

    document.addEventListener("keyup", event => {
        // P key pressed
        if (event.keyCode === 80) {
            pause()
        }
    })

    function pause() {
        if (game.paused) {
            game.unpause()
            pauseIcon.className = "fas fa-pause"
        } else {
            game.pause()
            pauseIcon.className = "fas fa-play"
        }
    }

    newGameButton.addEventListener("click", () => {
        game.end()
        game.start()
    })
})
