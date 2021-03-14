// Globals
const HEIGHT = 500
const WIDTH = 800

const KEY_TO_NAME = {
    32: "space",
    38: "up",
    87: "up",
    40: "down",
    83: "down",
    39: "right",
    68: "right",
    37: "left",
    65: "left"
}


class Arrow {
    constructor () {
        // Data
        this.position = {
            x: 0,
            y: 0
        }
        this.direction = 0

        this.step = 4
        this.edgeOffset = 25
        this.image = "/images/arrow.png"
        this.shootInterval = 400
        this.size = 40
        this.maxHealth = 100
        this.health = this.maxHealth
        this.power = 10

        this.mouse = {
            x: null,
            y: null,
        }
        this.keysDown = []

        // Elements
        this.arrow = null
        this.arrowImage = null
        this.map = document.getElementById("map")

        // Mouse position
        document.addEventListener("mousemove", event => {
            this.mouse = {
                x: event.clientX,
                y: event.clientY
            }
        })

        this.create()
        this.draw()
    }

    create() {
        // Arrow
        const arrow = document.createElement("div")
        arrow.id = "arrow"
        arrow.className = "sprite"

        // Arrow image
        const arrowImage = document.createElement("img")
        arrowImage.id = "arrow-image"
        arrowImage.className = "sprite-image"
        arrowImage.src = this.image
        arrowImage.draggable = false

        arrow.append(arrowImage)
        this.map.append(arrow)
        this.arrow = document.getElementById("arrow")
        this.arrowImage = document.getElementById("arrow-image")
        
        this.healthBar = new HealthBar(this.arrow)
    }

    updateDirection() {
        const x = this.mouse.x - (window.innerWidth / 2 + this.position.x)
        const y = this.mouse.y - (window.innerHeight / 2 - this.position.y)

        let angle = -radToDeg(Math.atan(y / x))
        if (x < 0) {
            angle += 180
        }
        if (angle < 0) {
            angle += 360
        }
        this.direction = angle 
    }

    updatePosition() {
        const pos = { x: this.position.x, y: this.position.y }

        for (const action of this.keysDown) {
            switch (action) {
                case "up":
                    if (pos.y < HEIGHT / 2 - this.edgeOffset) {
                        pos.y += this.step
                    }
                    break
                case "down":
                    if (pos.y > -HEIGHT / 2 + this.edgeOffset) {
                        pos.y -= this.step
                    }
                    break
                case "right":
                    if (pos.x < WIDTH / 2 - this.edgeOffset) {
                        pos.x += this.step
                    }
                    break
                case "left":
                    if (pos.x > -WIDTH / 2 + this.edgeOffset) {
                        pos.x -= this.step
                    }
                    break
                case "space":
                    break
            }
        }

        return pos
    }

    draw() {
        this.updateDirection()
        this.arrow.style.left = `${WIDTH / 2 + this.position.x}px`
        this.arrow.style.top = `${HEIGHT / 2 - this.position.y}px`
        this.arrowImage.style.transform = `translate(-50%, -50%) rotate(${-this.direction}deg)`
    }

    isHit(power) {
        if (this.health > 0) {
            this.health -= power
            if (this.health < 0) {
                this.health = 0
            }

            this.healthBar.update(this.health / this.maxHealth * 100)

            if (this.health === 0) {
                this.arrow.style.opacity = "0"
            }
        }
    }

}


class Projectile {
    constructor (params) {
        // Data
        this.position = params.position
        this.direction = params.direction

        this.speed = params.speed || 7
        this.edgeOffset = 10
        this.image = params.image || "/images/ball.svg"
        this.size = 10
        this.power = params.power || 10
        this.shotBy = params.shotBy || "arrow"

        // State
        this.shouldDelete = false

        // Elements
        this.map = document.getElementById("map")

        this.create()
        this.draw()
    }

    create() {
        const element = document.createElement("img")
        const id = generateId() 
        element.id = `projectile-${id}`
        element.className = "sprite"
        element.src = this.image
        element.draggable = false
        this.map.append(element)
        
        this.element = document.getElementById(`projectile-${id}`)
        this.element.style.transform = `translate(-50%, -50%) rotate(${-this.direction}deg)`
        this.element.style.width = `${this.size}px`
    }

    updatePosition() {
        this.position.x += this.speed * Math.cos(degToRad(this.direction))
        this.position.y += this.speed * Math.sin(degToRad(this.direction))

        if (
            this.position.x > WIDTH / 2 - this.edgeOffset ||
            this.position.x < -WIDTH / 2 + this.edgeOffset ||
            this.position.y > HEIGHT / 2 - this.edgeOffset ||
            this.position.y < -HEIGHT / 2 + this.edgeOffset
        ) {
            this.shouldDelete = true
            this.element.remove()
        }
    }

    draw() {
        this.updatePosition()
        this.element.style.left = `${WIDTH / 2 + this.position.x}px`
        this.element.style.top = `${HEIGHT / 2 - this.position.y}px`
    }
}

class Circle {
    constructor () {
        // Data
        this.position = {
            x: 320,
            y: 0
        }

        this.maxHealth = 1000
        this.health = this.maxHealth
        this.image = "/images/circle.svg"
        
        // Elements
        this.circle = document.getElementById("island")
        this.map = document.getElementById("map")
        
        // Island
        const circle = document.createElement("div")
        circle.className = "sprite"
        circle.id = "circle"

        // Ship image
        const circleImage = document.createElement("img")
        circleImage.id = "circle-image"
        circleImage.className = "sprite-image"
        circleImage.src = this.image
        circleImage.draggable = false

        circle.append(circleImage)
        this.map.append(circle)
        this.circle = document.getElementById("circle")
        this.circleImage = document.getElementById("circle-image")
        
        this.healthBar = new HealthBar(this.circle)
        
        this.circle.style.left = `${WIDTH / 2 + this.position.x}px`
        this.circle.style.top = `${HEIGHT / 2 - this.position.y}px`
    }

    isHit(power) {
        if (this.health > 0) {
            this.health -= power
            if (this.health < 0) {
                this.health = 0
            }

            this.healthBar.update(this.health / this.maxHealth * 100)

            if (this.health === 0) {
                this.circle.style.opacity = "0"
            }
        }
    }
}

class HealthBar {
    constructor (sprite) {
        // Sprite
        this.sprite = sprite

        // Colors
        this.colors = {
            green: [0, 255, 0],
            yellow: [255, 230, 0],
            red: [255, 0, 0]
        }
        this.color = this.colors.green

        this.create()
        this.update(100)
    }

    create() {
        // Container
        const container = document.createElement("div")
        const id = generateId()
        container.id = `health-bar-container-${id}`
        container.className = "health-bar-container"

        // Bar
        const bar = document.createElement("div")
        bar.id = `health-bar-${id}`
        bar.className = "health-bar"

        container.append(bar)
        this.sprite.append(container)
        this.container = document.getElementById(`health-bar-container-${id}`)
        this.bar = document.getElementById(`health-bar-${id}`)
    }

    update(percent) {
        if (percent > 50 && percent <= 100) {
            // Initial: 50 < n <= 100
            // Scaled:  1  > n >= 0
            const scale = 1 - (percent - 50) / 50
            // Subtract yellow from green vector
            const difference = vector_subtract(this.colors.yellow, this.colors.green)
            // Add green vector to scalar product of difference and scale
            this.color = vector_add(this.colors.green, vector_scalar_multiply(difference, scale))
        } else if (percent > 10 && percent <= 50) {
            // Initial: 10 < n <= 50
            // Scaled:  1  > n >= 0
            const scale = 1 - (percent - 10) / 40
            // Subtract yellow from red vector
            const difference = vector_subtract(this.colors.red, this.colors.yellow)
            // Add yellow vector to scalar product of difference and scale
            this.color = vector_add(this.colors.yellow, vector_scalar_multiply(difference, scale))
        } else if (percent >= 0 && percent <= 10) {
            this.color = this.colors.red
        }

        this.bar.style.backgroundColor = `rgb(${this.color.join(",")})`
        this.bar.style.width = `${percent}%`
    }

}

class Enemy {
    constructor () {
        // Data
        this.position = {
            x: 0,
            y: 0
        }
        this.direction = 0
        this.target = null

        this.speed = 1
        this.edgeOffset = 50
        this.image = "/images/enemy.png"
        this.shootInterval = 2000
        this.size = 40
        this.radius = 50
        this.maxHealth = 100
        this.health = 100
        this.power = 10

        // State
        this.canMove = true
        this.canShoot = false
        this.shouldDelete = false

        // Elements
        this.enemy = null
        this.enemyImage = null
        this.map = document.getElementById("map")

        this.position.x = -WIDTH / 2
        this.position.y = randomNumber(-HEIGHT / 2 + this.edgeOffset, HEIGHT / 2 - this.edgeOffset)

        this.create()
        this.draw()
    }

    create() {
        // Enemy
        const enemy = document.createElement("div")
        const id = generateId()
        enemy.id = `enemy-${id}`
        enemy.className = "sprite enemy"

        // Enemy image
        const enemyImage = document.createElement("img")
        enemyImage.id = `enemy-image-${id}`
        enemyImage.className = "sprite-image enemy-image"
        enemyImage.src = this.image
        enemyImage.draggable = false

        enemy.append(enemyImage)
        this.map.append(enemy)
        this.enemy = document.getElementById(`enemy-${id}`)
        this.enemyImage = document.getElementById(`enemy-image-${id}`)
        
        this.healthBar = new HealthBar(this.enemy)
    }

    updateDirection() {
        const x = this.target.position.x - this.position.x
        const y = this.target.position.y - this.position.y

        let angle = radToDeg(Math.atan(y / x))
        if (x < 0) {
            angle += 180
        }
        if (angle < 0) {
            angle += 360
        }
        this.direction = angle 
    }

    updatePosition() {
        this.position.x += this.speed * Math.cos(degToRad(this.direction))
        this.position.y += this.speed * Math.sin(degToRad(this.direction))
    }

    draw() {
        this.enemy.style.left = `${WIDTH / 2 + this.position.x}px`
        this.enemy.style.top = `${HEIGHT / 2 - this.position.y}px`
        this.enemyImage.style.transform = `translate(-50%, -50%) rotate(${-this.direction - 90}deg)`
    }

    isHit(power) {
        if (this.health > 0) {
            this.health -= power
            if (this.health < 0) {
                this.health = 0
            }

            this.healthBar.update(this.health / this.maxHealth * 100)

            if (this.health === 0) {
                this.enemy.style.opacity = "0"
                this.canShoot = false
                this.shouldDelete = true
                setTimeout(() => {
                    this.enemy.remove()
                }, 300)
            }
        }
    }
}


class Game {
    constructor () {
        // Sprites
        this.arrow = null
        this.enemies = []
        this.projectiles = []
        this.circle = null
        this.wave = 0

        // Elements
        this.map = document.getElementById("map")

        // State
        this.arrowCanShoot = true
        this.stop = false
        this.autoShoot = false

        // Data
        this.keysDown = []

        // Event listeners

        // Key down
        document.addEventListener("keydown", event => {
            if (event.keyCode in KEY_TO_NAME) {
                event.preventDefault()
                // Only add key if not already in list
                if (!this.keysDown.includes(KEY_TO_NAME[event.keyCode])) {
                    this.keysDown.push(KEY_TO_NAME[event.keyCode])
                    this.arrow.keysDown = this.keysDown
                }
                if (KEY_TO_NAME[event.keyCode] === "space") {
                    this.arrowShoot()
                }
            }
        })

        // Key up
        document.addEventListener("keyup", event => {
            if (event.keyCode in KEY_TO_NAME) {
                const index = this.keysDown.indexOf(KEY_TO_NAME[event.keyCode])
                if (index > -1) {
                    this.keysDown.splice(index, 1)
                    this.arrow.keysDown = this.keysDown
                }
            } else if (event.keyCode === 67 && !event.shiftKey && !event.ctrlKey) {
                this.autoShoot = !this.autoShoot
            }
        })

        // Click
        this.map.addEventListener("click", () => {
            this.arrowShoot()
            console.log("arrow", this.arrow.direction, this.keysDown)
        })

        // Prevent context menu from opening over map
        this.map.addEventListener("contextmenu", event => {
            event.preventDefault()
        })

        // Mouse down
        document.addEventListener("mousedown", () => {
            if (!this.keysDown.includes("space")) {
                this.keysDown.push("space")
                this.arrow.keysDown = this.keysDown
            }
        })


        // Mouse up
        document.addEventListener("mouseup", () => {
            const index = this.keysDown.indexOf("space")
            if (index > -1) {
                this.keysDown.splice(index, 1)
                this.arrow.keysDown = this.keysDown
            }
        })
    }

    start() {
        // Clear map
        this.map.textContent = ""
        
        // Reset sprites
        this.arrow = new Arrow()
        this.enemies = []
        this.projectiles = []
        this.circle = new Circle()

        const frame = () => {
            // Arrow
            this.updateArrowPosition()
            this.arrow.draw()

            if ((this.keysDown.includes("space") || this.autoShoot) && this.arrowCanShoot) {
                this.arrowShoot()
            }

            // Delete projectiles
            const deletedProjectiles = []
            for (let i = 0; i < this.projectiles.length; i++) {
                if (this.projectiles[i].shouldDelete) {
                    deletedProjectiles.push(i)
                } else {
                    this.projectiles[i].draw()
                }
            }
            if (deletedProjectiles.length) {
                deletedProjectiles.sort((a, b) => b - a)
                for (const index of deletedProjectiles) {
                    this.projectiles.splice(index, 1)
                }
            }

            // Delete enemies
            const deletedEnemies = []
            for (let i = 0; i < this.enemies.length; i++) {
                if (this.enemies[i].shouldDelete) {
                    deletedEnemies.push(i)
                }
            }
            if (deletedEnemies.length) {
                deletedEnemies.sort((a, b) => b - a)
                for (const index of deletedEnemies) {
                    this.enemies.splice(index, 1)
                }
            }

            // Projectiles hit things
            for (let i = 0; i < this.projectiles.length; i++) {
                if (distance(this.projectiles[i].position, this.circle.position) < 50 && this.projectiles[i].shotBy === "enemy") {
                    this.circle.isHit(this.projectiles[i].power)
                    this.projectiles[i].shouldDelete = true
                    this.projectiles[i].element.remove()
                }
                if (distance(this.projectiles[i].position, this.arrow.position) < this.arrow.size && this.projectiles[i].shotBy === "enemy") {
                    this.arrow.isHit(this.projectiles[i].power)
                    this.projectiles[i].shouldDelete = true
                    this.projectiles[i].element.remove()
                }

                for (let j = 0; j < this.enemies.length; j++) {
                    if (distance(this.projectiles[i].position, this.enemies[j].position) < this.enemies[j].size && this.projectiles[i].shotBy === "arrow") {
                        this.enemies[j].isHit(this.projectiles[i].power)
                        this.projectiles[i].shouldDelete = true
                        this.projectiles[i].element.remove()
                    }
                }
            }

            // Enemies
            for (let i = 0; i < this.enemies.length; i++) {
                this.drawEnemy(this.enemies[i])
            }

            if (this.enemies.length === 0) {
                this.wave++
                for (let w = 0; w < this.wave; w++) {
                    this.enemies.push(new Enemy())
                }
            }

            // Next frame
            if (!this.stop) {
                requestAnimationFrame(frame)
            }
        }

        // First frame
        requestAnimationFrame(frame)
    }

    end() {
        clearInterval(this.loop)
    }

    arrowShoot() {
        if (this.arrowCanShoot) {
            this.arrowCanShoot = false
            
            setTimeout(() => {
                this.arrowCanShoot = true
            }, this.arrow.shootInterval)

            this.projectiles.push(new Projectile({
                position: {
                    x: this.arrow.position.x,
                    y: this.arrow.position.y
                },
                direction: this.arrow.direction,
                power: this.arrow.power,
                shotBy: "arrow"
            }))
        }
    }

    updateArrowPosition() {
        const pos = this.arrow.updatePosition()
        let can_update = true

        if (can_update) {
            this.arrow.position = pos
        }
    }

    drawEnemy(enemy) {
        if (enemy.canMove) {
            if (distance(enemy.position, this.circle.position) < HEIGHT / 2 + 200) {
                enemy.canMove = false
                enemy.canShoot = true
            }
            enemy.updatePosition()
        } else {
            // Determine enemy target - circle or arrow
            enemy.target = distance(enemy.position, this.circle.position) < distance(enemy.position, this.arrow.position) ? this.circle : this.arrow
            
            enemy.updateDirection()

            // Shoot
            if (enemy.canShoot) {
                enemy.canShoot = false
                setTimeout(() => {
                    enemy.canShoot = true
                }, enemy.shootInterval)

                this.projectiles.push(new Projectile({
                    position: {
                        x: enemy.position.x,
                        y: enemy.position.y
                    },
                    direction: enemy.direction,
                    power: enemy.power,
                    shotBy: "enemy"
                }))
            }
        }

        enemy.draw()
    }
}