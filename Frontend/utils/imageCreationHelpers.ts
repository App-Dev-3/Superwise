export function downloadImageFromCanvas(canvasId: string) {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement
    if (!canvas) {
        console.error(`Canvas with id ${canvasId} not found`)
        return
    }
    const link = document.createElement('a')
    link.download = 'supervision-confirmation.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
}