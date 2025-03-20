import { useContext } from 'react';
import { frameDirectorContext } from '../context/FrameDirectorContext';

export default function useFrameDirector() {
    return useContext(frameDirectorContext);
}
