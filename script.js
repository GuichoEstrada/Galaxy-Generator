import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI({
    title: 'Galaxy Generator'
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Galaxy
 */
let geometry, material, points = null

const galaxyParameters = {
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 5,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    innerColor: '#ff6030',
    outerColor: '#1b3984',
    rotationX: 0,
    rotationY: 0.05,
    rotationZ: 0
}

const generateGalaxy = () => {

    // Destroy old galaxies for performance optimization
    if(points !== null){
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    // Geometry
    geometry = new THREE.BufferGeometry()

    const positions = new Float32Array(galaxyParameters.count * 3)

    const colors = new Float32Array(galaxyParameters.count * 3)
    const insideColor = new THREE.Color(galaxyParameters.innerColor)
    const outsideColor = new THREE.Color(galaxyParameters.outerColor)

    for(let i = 0; i < galaxyParameters.count * 3; i++) {
        const i3 = i *3
        /**
         * Position
         */
        // Length of the galaxy's branches
        const radius = Math.random() * galaxyParameters.radius
        // Get the angle of each branch depending on the number of branches
        const branchAngle = (i % galaxyParameters.branches) / galaxyParameters.branches * Math.PI * 2
        // Angle of every point in the radius when its spinning
        const spinAngle = radius * galaxyParameters.spin

        const randomX = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParameters.randomness * radius
        const randomY = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParameters.randomness * radius
        const randomZ = Math.pow(Math.random(), galaxyParameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * galaxyParameters.randomness * radius

        // x
        positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX
        // y
        positions[i3 + 1] = randomY
        // z
        positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ

        /**
         * Color
         */
        const mixedColor = insideColor.clone()
        mixedColor.lerp(outsideColor, radius/galaxyParameters.radius)
        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

    // Material
    material = new THREE.PointsMaterial({
        size: galaxyParameters.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true
    })

    // Points
    points = new THREE.Points(geometry, material)

    scene.add(points)
}
generateGalaxy()

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Rotation animation
    points.rotation.y = elapsedTime * galaxyParameters.rotationY
    points.rotation.x = elapsedTime * galaxyParameters.rotationX
    points.rotation.z = elapsedTime * galaxyParameters.rotationZ

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()

/**
 * Tweaks
 */
gui.add(galaxyParameters, 'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'rotationX').min(-0.05).max(0.05).step(0.001).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'rotationY').min(-0.05).max(0.05).step(0.001).onFinishChange(generateGalaxy)
gui.add(galaxyParameters, 'rotationZ').min(-0.05).max(0.05).step(0.001).onFinishChange(generateGalaxy)
gui.addColor(galaxyParameters, 'innerColor').onFinishChange(generateGalaxy)
gui.addColor(galaxyParameters, 'outerColor').onFinishChange(generateGalaxy)
