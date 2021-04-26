import {LogBox} from 'react-native';

LogBox.ignoreLogs(['Require cycle']);

import {LogLevel, RNFFmpegConfig} from 'react-native-ffmpeg';

RNFFmpegConfig.setLogLevel(LogLevel.AV_LOG_WARNING);
