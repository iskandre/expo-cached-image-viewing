import React, { useEffect, useState, useRef } from "react";
import { Animated } from "react-native";
import * as FileSystem from "expo-file-system";
import * as CONST from "../../consts";
const CachedImage = (props) => {
    const { source, cacheKey, placeholderContent, ...rest } = props;
    const { uri, headers, expiresIn } = source;
    const fileURI = `${CONST.IMAGE_CACHE_FOLDER}${cacheKey}`;
    const [imgUri, setImgUri] = useState(fileURI);
    const componentIsMounted = useRef(true);
    const requestOption = headers ? { headers } : undefined;
    const _callback = () => {
        if (!componentIsMounted.current) {
            void downloadResumableRef.current.pauseAsync();
            void FileSystem.deleteAsync(fileURI, { idempotent: true }); // delete file locally if it was not downloaded properly
        }
    };
    const downloadResumableRef = useRef(FileSystem.createDownloadResumable(uri, fileURI, requestOption, _callback));
    useEffect(() => {
        setImgUri(uri);
        void loadImage();
        return () => {
            componentIsMounted.current = false;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps
    const loadImage = async () => {
        var _a, _b, _c;
        try {
            // Use the cached image if it exists
            const metadata = await FileSystem.getInfoAsync(fileURI);
            const expired = Boolean(metadata.exists && expiresIn &&
                new Date().getTime() / 1000 - metadata.modificationTime > expiresIn);
            // console.log({expiresIn, expired})
            // console.log({modificationTime: metadata.modificationTime, currentTime: new Date().getTime() / 1000})
            // console.log({metadata})
            if (!metadata.exists || ((_a = metadata) === null || _a === void 0 ? void 0 : _a.size) === 0 || expired) {
                if (componentIsMounted.current) {
                    setImgUri(null);
                    if (expired) {
                        await FileSystem.deleteAsync(fileURI, { idempotent: true });
                    }
                    // download to cache
                    setImgUri(null);
                    //console.log('downloading to file ' + fileURI)
                    const response = await downloadResumableRef.current.downloadAsync();
                    if (componentIsMounted.current && ((_b = response) === null || _b === void 0 ? void 0 : _b.status) === 200) {
                        setImgUri(`${fileURI}?`); // deep clone to force re-render
                    }
                    if (((_c = response) === null || _c === void 0 ? void 0 : _c.status) !== 200) {
                        FileSystem.deleteAsync(fileURI, { idempotent: true }); // delete file locally if it was not downloaded properly
                    }
                }
            }
        }
        catch (err) {
            // console.log({ err })
            setImgUri(uri);
        }
    };
    // console.log({placeholderContent})
    if (!imgUri)
        return <>{placeholderContent}</> || null;
    return (<Animated.Image 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} source={{
        ...source,
        uri: imgUri,
    }}/>);
};
export const CacheManager = {
    addToCache: async ({ file, key }) => {
        await FileSystem.copyAsync({
            from: file,
            to: `${CONST.IMAGE_CACHE_FOLDER}${key}`,
        });
        // const uri = await FileSystem.getContentUriAsync(`${CONST.IMAGE_CACHE_FOLDER}${key}`)
        // return uri
        return await CacheManager.getCachedUri({ key });
    },
    getCachedUri: async ({ key }) => {
        return await FileSystem.getContentUriAsync(`${CONST.IMAGE_CACHE_FOLDER}${key}`);
    },
    downloadAsync: async ({ uri, key, options }) => {
        return await FileSystem.downloadAsync(uri, `${CONST.IMAGE_CACHE_FOLDER}${key}`, options);
    },
};
export default CachedImage;
