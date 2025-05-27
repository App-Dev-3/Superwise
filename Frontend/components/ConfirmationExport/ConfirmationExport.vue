<script setup lang="ts">
	import { onMounted, ref } from 'vue';
	import { renderSVG } from 'uqr';
	import { useI18n } from 'vue-i18n';

	const { t } = useI18n();

	interface Props {
		canvasId: string;
		studentName: string;
		studentEmail: string;
		supervisorName: string;
		supervisorEmail: string;
		acceptedDate: string;
		confirmationUrl?: string;
	}

	const props = withDefaults(defineProps<Props>(), {
		confirmationUrl: '',
	});

	onMounted(drawCanvas);

	const canvas = ref();

	const logoSrc = new URL(
		'/public/images/appLanding_logo_light.svg',
		import.meta.url,
	).href;
	const fontFamily = 'helvetica, Arial, sans-serif';

	function drawCanvas() {
		if (!canvas.value) {
			console.error('Canvas element not found');
			return;
		}
		const ctx = canvas.value.getContext('2d');
		const logo = new Image();
		logo.src = logoSrc;

		logo.onload = () => {
			const width = canvas.value.width;
			const height = canvas.value.height;

			// Gradient background
			const gradient = ctx.createLinearGradient(
				0,
				0,
				0,
				height,
			);
			gradient.addColorStop(0, '#dadaf8');
			gradient.addColorStop(1, '#d8fff5');
			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, width, height);

			// BG pattern so its a bit harder to fake
			ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
			for (let i = 0; i < width; i += 20) {
				for (let j = 0; j < height; j += 20) {
					ctx.beginPath();
					ctx.arc(i, j, 1, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			// Calculate logo size while preserving aspect ratio
			const maxLogoSize = width * 0.15; // Max width is 15% of canvas width
			const logoAspectRatio = logo.width / logo.height;

			let logoWidth, logoHeight;

			if (logoAspectRatio >= 1) {
				// Landscape or square logo
				logoWidth = maxLogoSize;
				logoHeight = maxLogoSize / logoAspectRatio;
			} else {
				// Portrait logo
				logoHeight = maxLogoSize;
				logoWidth = maxLogoSize * logoAspectRatio;
			}

			// Logo (centered top)
			ctx.drawImage(
				logo,
				(width - logoWidth) / 2,
				30,
				logoWidth,
				logoHeight,
			);

			// Adjust start position for text based on logo height
			const titleY = 30 + logoHeight + 80;

			// Title
			ctx.fillStyle = '#1e293b';
			ctx.font = `bold 48px ${fontFamily}`;
			ctx.textAlign = 'center';
			ctx.fillText(
				t('confirmation.title'),
				width / 2,
				titleY,
			);

			// Info block - center aligned
			const centerX = width / 2;
			let y = titleY + 60;
			const gap = 50;
			y += gap;

			// Student section
			ctx.font = `bold 36px ${fontFamily}`;
			ctx.fillStyle = '#000000';
			ctx.fillText(
				t('confirmation.student') + ':',
				centerX,
				y,
			);
			y += gap;

			// Student details
			ctx.font = `30px ${fontFamily}`;
			ctx.fillStyle = '#000000';
			ctx.fillText(`${props.studentName}`, centerX, y);
			y += gap;
			ctx.fillText(`${props.studentEmail}`, centerX, y);
			y += gap * 1.5;

			// Supervisor section
			ctx.font = `bold 36px ${fontFamily}`;
			ctx.fillStyle = '#000000';
			ctx.fillText(
				t('confirmation.supervisor') + ':',
				centerX,
				y,
			);
			y += gap;

			// Supervisor details
			ctx.font = `30px ${fontFamily}`;
			ctx.fillStyle = '#000000';
			ctx.fillText(`${props.supervisorName}`, centerX, y);
			y += gap;
			ctx.fillText(`${props.supervisorEmail}`, centerX, y);
			y += gap * 1.5;

			// Acceptance date
			ctx.font = `bold 36px ${fontFamily}`;
			ctx.fillStyle = '#000000';
			ctx.fillText(t('confirmation.details'), centerX, y);
			y += gap;

			ctx.font = `30px ${fontFamily}`;
			ctx.fillStyle = '#000000';
			ctx.fillText(
				t('confirmation.acceptedOn', {
					date: props.acceptedDate,
				}),
				centerX,
				y,
			);

			if (props.confirmationUrl.length > 0) {
				const qrSize = 150;
				const qrX = (width - qrSize) / 2;
				const qrY = y + gap;

				const svg = renderSVG(props.confirmationUrl);
				// Convert SVG to data URL
				const svgBlob = new Blob([svg], {
					type: 'image/svg+xml;charset=utf-8',
				});
				const svgUrl = URL.createObjectURL(svgBlob);

				// Create image from SVG and draw on canvas
				const qrImage = new Image();
				qrImage.onload = () => {
					ctx.drawImage(
						qrImage,
						qrX,
						qrY,
						qrSize,
						qrSize,
					);

					// Add QR code label
					ctx.font = `20px ${fontFamily}`;
					ctx.fillStyle = '#333333';
					ctx.fillText(
						t('confirmation.scanToVerify'),
						centerX,
						qrY + qrSize + 30,
					);

					// Clean up object URL
					URL.revokeObjectURL(svgUrl);
				};
				qrImage.src = svgUrl;
			}

			// Add decorative border
			ctx.strokeStyle = 'rgba(255,255,255,0.3)';
			ctx.lineWidth = 20;
			ctx.beginPath();
			ctx.rect(20, 20, width - 40, height - 40, 25);
			ctx.stroke();
		};
	}
</script>

<template>
	<div class="hidden">
		<canvas
			:id="props.canvasId"
			ref="canvas"
			width="1920"
			height="1080"
			class=""
		/>
	</div>
</template>

<style scoped>
	canvas {
		background: #f9f9f9;
		max-width: 100%;
		height: auto;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
	}
</style>
