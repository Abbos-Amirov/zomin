/**
 * Mobile-only: always returns 'mobile' for QR menu app
 */
const useDeviceDetect = (): 'mobile' | 'desktop' => {
	return 'mobile';
};

export default useDeviceDetect;
