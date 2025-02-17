/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
 import React from "react";
 import { ImageSourceCached } from "../../@types";
 declare type Props = {
     imageSrc: ImageSourceCached;
     onRequestClose: () => void;
     onZoom: (scaled: boolean) => void;
     onLongPress: (image: ImageSourceCached) => void;
     delayLongPress: number;
     swipeToCloseEnabled?: boolean;
     doubleTapToZoomEnabled?: boolean;
 };
 declare const _default: React.MemoExoticComponent<({ imageSrc, onZoom, onRequestClose, onLongPress, delayLongPress, swipeToCloseEnabled, doubleTapToZoomEnabled, }: Props) => JSX.Element>;
 export default _default;
 