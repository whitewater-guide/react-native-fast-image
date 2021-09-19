import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import SectionFlex from './SectionFlex'
import FastImage from 'react-native-fast-image'
import Section from './Section'
import FeatureText from './FeatureText'
import Button from './Button'
// @ts-ignore
import { createImageProgress } from 'react-native-image-progress'

const IMAGE_URLS = [
    'https://cdn-images-1.medium.com/max/1600/1*-CY5bU4OqiJRox7G00sftw.gif',
    'https://media.giphy.com/media/GEsoqZDGVoisw/giphy.gif',
    'https://image.that.always.fails.com',
]

const Image = createImageProgress(FastImage)

interface PreloadExampleProps {}

class PreloadExample extends Component<PreloadExampleProps> {
    state = {
        show: false,
        urls: [...IMAGE_URLS],
        progress: [0, 0],
        result: [0, 0],
        preloadedURLs: [],
    }

    bustCache = () => {
        const key = Math.random().toString()
        const bust = `?bust=${key}`
        // Preload images. This can be called anywhere.
        const url = IMAGE_URL + bust
        this.setState({
            urls: IMAGE_URLS.map(url => `${url}?bust=${uuid()}`),
            show: false,
            progress: [0, 0],
            result: [0, 0],
            preloadedURLs: [],
        })
    }

    onProgress = (urls, loaded, total) => {
        this.setState({ progress: [loaded, total], preloadedURLs: urls })
    }

    onComplete = (urls, loaded, skipped) => {
        this.setState({ result: [skipped, loaded], preloadedURLs: urls })
    }

    preload = () => {
        FastImage.preload(
          this.state.urls.map(uri => ({ uri })),
          this.onProgress,
          this.onComplete,
        )
    }

    showImage = () => {
        this.setState({ show: true })
    }

    renderImage = uri => {
        return this.state.show ? (
          <Image key={uri} style={styles.image} source={{ uri }} />
        ) : (
          <View key={uri} style={styles.image} />
        )
    }

    renderImages = () => {
        const { urls, show } = this.state
        return <View style={styles.images}>{urls.map(this.renderImage)}</View>
    }

    render() {
        return (
            <View>
                <Section>
                    <FeatureText text="• Preloading." />
                    <FeatureText text="• Progress indication using react-native-image-progress." />
                </Section>
                <SectionFlex style={styles.section}>
                    {this.state.show ? (
                        <Image
                            style={styles.image}
                            source={{ uri: this.state.url }}
                        />
                    ) : (
                        <View style={styles.image} />
                    )}
                    <View style={styles.buttons}>
                        <View style={styles.buttonView}>
                            <Button text="Bust" onPress={this.bustCache} />
                        </View>
                        <View style={styles.buttonView}>
                            <Button text="Preload" onPress={this.preload} />
                        </View>
                        <View style={styles.buttonView}>
                            <Button text="Render" onPress={this.showImage} />
                        </View>
                    </View>
                </SectionFlex>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    buttonView: { flex: 1 },
    section: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    buttons: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 10,
    },
    image: {
        backgroundColor: '#ddd',
        margin: 20,
        marginBottom: 10,
        height: 100,
        width: 100,
    },
    images: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
})

export default PreloadExample
