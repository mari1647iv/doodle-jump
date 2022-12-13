document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid')
    const doodler = document.createElement('div')
    let isGameOver = false
    let speed = 30
    let platformCount = 12
    let platforms = []
    let score = 0
    const scoreSpan = document.querySelector('#score')
    let doodlerLeftSpace = 50
    let startPoint = 150
    let doodlerBottomSpace = startPoint
    const gravity = 0.9
    let upTimerId
    let downTimerId
    let isJumping = true
    let isGoingLeft = false
    let isGoingRight = false
    let leftTimerId
    let rightTimerId

    class Platform {
        constructor(newPlatBottom, isBroken) {
            this.left = Math.random() * 515
            this.bottom = newPlatBottom
            this.visual = document.createElement('div')
            this.isBroken = isBroken;

            const visual = this.visual
            visual.classList.add(isBroken ? 'broken-platform' : 'platform')
            visual.style.left = this.left + 'px'
            visual.style.bottom = this.bottom + 'px'
            grid.appendChild(visual)
        }
    }


    function createPlatforms() {
        let brokenIndex = Math.round(Math.random() * (platformCount - 1));
        for (let i = 0; i < platformCount; i++) {
            let platGap = 900 / platformCount
            let newPlatBottom = 100 + i * platGap
            let newPlatform = new Platform(newPlatBottom, (i === brokenIndex) ? true : false)
            platforms.push(newPlatform)
            console.log(platforms)
        }
    }

    function movePlatforms() {
        if (doodlerBottomSpace > 200) {
            platforms.forEach(platform => {
                platform.bottom -= 4
                let visual = platform.visual
                visual.style.bottom = platform.bottom + 'px'

                if (platform.bottom < 10) {
                    let firstPlatform = platforms[0].visual
                    let isPlatformBroken = platforms[0].isBroken;
                    firstPlatform.classList.remove('platform')
                    firstPlatform.classList.remove('broken-platform')
                    platforms.shift()
                    console.log(platforms)
                    score++
                    scoreSpan.innerHTML = score;
                    if ((score % 10 === 0) && (speed > 10)) {
                        speed--;
                    }
                    if ((score % 20 === 0) && (platformCount > 5)) {
                        --platformCount;
                    } else {
                        var newPlatform = new Platform(900, isPlatformBroken)
                        platforms.push(newPlatform)
                    }
                }
            })
        }

    }

    function createDoodler() {
        grid.appendChild(doodler)
        doodler.classList.add('doodler')
        doodlerLeftSpace = platforms[0].left
        doodler.style.left = doodlerLeftSpace + 'px'
        doodler.style.bottom = doodlerBottomSpace + 'px'
    }

    function fall() {
        isJumping = false
        clearInterval(upTimerId)
        downTimerId = setInterval(function() {
            doodlerBottomSpace -= 5
            doodler.style.bottom = doodlerBottomSpace + 'px'
            if (doodlerBottomSpace <= 0) {
                gameOver()
            }
            platforms.forEach(platform => {
                if (
                    (doodlerBottomSpace >= platform.bottom) &&
                    (doodlerBottomSpace <= (platform.bottom + 15)) &&
                    ((doodlerLeftSpace + 60) >= platform.left) &&
                    (doodlerLeftSpace <= (platform.left + 85)) &&
                    !isJumping
                ) {
                    console.log('tick')
                    startPoint = doodlerBottomSpace
                    if (platform.isBroken) {
                        platform.visual.classList.remove('broken-platform')
                        new Audio("./assets/crack.wav").play();
                    } else {
                        new Audio("./assets/jump.wav").play();
                    }
                    jump()
                    console.log('start', startPoint)
                    isJumping = true
                }
            })

        }, speed * 2 / 3)
    }

    function jump() {
        clearInterval(downTimerId)
        isJumping = true
        upTimerId = setInterval(function() {
            console.log(startPoint)
            console.log('1', doodlerBottomSpace)
            doodlerBottomSpace += 20
            doodler.style.bottom = doodlerBottomSpace + 'px'
            console.log('2', doodlerBottomSpace)
            console.log('s', startPoint)
            if (doodlerBottomSpace > (startPoint + 250)) {
                fall()
                isJumping = false
            }
        }, speed)
    }

    function moveLeft() {
        if (isGoingRight) {
            clearInterval(rightTimerId)
            isGoingRight = false
        }
        isGoingLeft = true
        leftTimerId = setInterval(function() {
            if (doodlerLeftSpace >= 0) {
                console.log('going left')
                doodlerLeftSpace -= 5
                doodler.style.left = doodlerLeftSpace + 'px'
            } else moveRight()
        }, speed * 2 / 3)
    }

    function moveRight() {
        if (isGoingLeft) {
            clearInterval(leftTimerId)
            isGoingLeft = false
        }
        isGoingRight = true
        rightTimerId = setInterval(function() {
            //changed to 313 to fit doodle image
            if (doodlerLeftSpace <= 513) {
                console.log('going right')
                doodlerLeftSpace += 5
                doodler.style.left = doodlerLeftSpace + 'px'
            } else moveLeft()
        }, speed * 2 / 3)
    }

    function moveStraight() {
        isGoingLeft = false
        isGoingRight = false
        clearInterval(leftTimerId)
        clearInterval(rightTimerId)
    }

    //assign functions to keyCodes
    function control(e) {
        doodler.style.bottom = doodlerBottomSpace + 'px'
        if (e.key === 'ArrowLeft') {
            moveLeft()
        } else if (e.key === 'ArrowRight') {
            moveRight()
        } else if (e.key === 'ArrowUp') {
            moveStraight()
        }
    }

    function gameOver() {
        isGameOver = true
        while (grid.firstChild) {
            console.log('remove')
            grid.removeChild(grid.firstChild)
        }
        grid.innerHTML = '<p>Score: <span id="score">' + score + '</span></p>'

        clearInterval(upTimerId)
        clearInterval(downTimerId)
        clearInterval(leftTimerId)
        clearInterval(rightTimerId)
    }

    function start() {
        if (!isGameOver) {
            scoreSpan.innerHTML = score;
            createPlatforms()
            createDoodler()
            setInterval(movePlatforms, speed)
            jump(startPoint)
            document.addEventListener('keyup', control)
        }
    }
    start()
})