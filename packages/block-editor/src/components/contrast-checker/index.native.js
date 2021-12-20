/**
 * External dependencies
 */
import { Text } from 'react-native';
import { colord, extend } from 'colord';
import namesPlugin from 'colord/plugins/names';
import a11yPlugin from 'colord/plugins/a11y';

/**
 * WordPress dependencies
 */
import { speak } from '@wordpress/a11y';
import { __ } from '@wordpress/i18n';
import { useEffect } from '@wordpress/element';
import { withPreferredColorScheme } from '@wordpress/compose';

/**
 * Internal dependencies
 */
import styles from './style.scss';

extend( [ namesPlugin, a11yPlugin ] );

function ContrastCheckerMessage( {
	colordBackgroundColor,
	colordTextColor,
	backgroundColor,
	textColor,
	msgStyle,
} ) {
	const msg =
		colordBackgroundColor.brightness() < colordTextColor.brightness()
			? __(
					'This color combination may be hard for people to read. Try using a darker background color and/or a brighter text color.'
			  )
			: __(
					'This color combination may be hard for people to read. Try using a brighter background color and/or a darker text color.'
			  );

	// Note: The `Notice` component can speak messages via its `spokenMessage`
	// prop, but the contrast checker requires granular control over when the
	// announcements are made. Notably, the message will be re-announced if a
	// new color combination is selected and the contrast is still insufficient.
	useEffect( () => {
		speak( __( 'This color combination may be hard for people to read.' ) );
	}, [ backgroundColor, textColor ] );

	return <Text style={ msgStyle }>{ msg }</Text>;
}

function ContrastChecker( {
	backgroundColor,
	fallbackBackgroundColor,
	fallbackTextColor,
	fontSize, // font size value in pixels
	isLargeText,
	textColor,
	getStylesFromColorScheme,
} ) {
	if (
		! ( backgroundColor || fallbackBackgroundColor ) ||
		! ( textColor || fallbackTextColor )
	) {
		return null;
	}

	const colordBackgroundColor = colord(
		backgroundColor || fallbackBackgroundColor
	);
	const colordTextColor = colord( textColor || fallbackTextColor );

	const hasTransparency =
		colordBackgroundColor.alpha() !== 1 || colordTextColor.alpha() !== 1;

	if (
		hasTransparency ||
		colordTextColor.isReadable( colordBackgroundColor, {
			level: 'AA',
			size:
				isLargeText || ( isLargeText !== false && fontSize >= 24 )
					? 'large'
					: 'small',
		} )
	) {
		return null;
	}

	const msgStyle = getStylesFromColorScheme(
		styles.message,
		styles.messageDark
	);

	return (
		<ContrastCheckerMessage
			backgroundColor={ backgroundColor }
			textColor={ textColor }
			colordBackgroundColor={ colordBackgroundColor }
			colordTextColor={ colordTextColor }
			msgStyle={ msgStyle }
		/>
	);
}

export default withPreferredColorScheme( ContrastChecker );
