import {
	interpolate,
	spring2,
	useCurrentFrame,
	useVideoConfig,
} from '@remotion/core';
import React from 'react';
import {Phone, PhoneHeight, PhoneWidth} from './Phone';

export const Orchestra: React.FC<{
	layers: number;
	yOffset: number;
	xOffset: number;
	phoneScale: number;
}> = ({layers, xOffset, yOffset, phoneScale}) => {
	const getColumnOffset = (c: number, r: number, f: number) => {
		return spring2({
			from: 0,
			to: (PhoneHeight + yOffset) * (r % 2 === 0 ? 1 : -1),
			config: {
				damping: 30,
				mass: 0.2,
				stiffness: 10,
				overshootClamping: true,
				restDisplacementThreshold: 0.001,
				restSpeedThreshold: 0.001,
			},
			fps: 30,
			frame: Math.max(0, frame - 4 - c * 8),
		});
	};
	const config = useVideoConfig();
	const rows = layers * 2 + 1;
	const columns = 4;
	const frame = useCurrentFrame();
	const p = spring2({
		config: {
			damping: 100,
			mass: 0.1,
			stiffness: 10,
			restSpeedThreshold: 0.00001,
			restDisplacementThreshold: 0.0001,
			overshootClamping: false,
		},
		fps: config.fps,
		frame,
		from: 0,
		to: 1,
	});
	const progress = interpolate({
		input: p,
		inputRange: [0, 1],
		outputRange: [3, 1.1],
		extrapolateLeft: 'clamp',
	});
	const scale = interpolate({
		input: p,
		inputRange: [0.4, 1],
		outputRange: [0, phoneScale],
		extrapolateLeft: 'clamp',
	});

	return (
		<div
			style={{
				height: config.height,
				width: config.width,
				transform: `scale(${progress})`,
			}}
		>
			{new Array(rows)
				.fill(true)
				.map((_, r) => r)
				.map((r) => {
					const actualColumns = r % 2 === 1 ? columns + 1 : columns;
					return (
						<React.Fragment key={r}>
							{new Array(actualColumns)
								.fill(true)
								.map((_, c) => c)
								.map((c) => {
									const offset = r % 2 === 1 ? xOffset : 0;
									const extraLeft = r % 2 === 1 ? xOffset : 0;
									const middle = r === 7 && c === 2;

									return (
										<Phone
											className={`c${c}r${r}`}
											key={[c, r].join(',')}
											phoneScale={middle ? phoneScale : scale}
											style={{
												left:
													config.width / 2 -
													PhoneWidth / 2 +
													c * xOffset -
													((actualColumns - 1) * xOffset) / 2 +
													offset -
													extraLeft,
												top:
													config.height / 2 -
													PhoneHeight / 2 +
													r * yOffset -
													((rows - 1) * yOffset) / 2 +
													getColumnOffset(c, r, frame),
											}}
										/>
									);
								})}
						</React.Fragment>
					);
				})}
		</div>
	);
};
