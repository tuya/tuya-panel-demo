# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.


## [1.0.4] - 2023-07-17

- Change the TYRCTLaserMap component to IndoorMap component which implement with cross-end technology

1. Add ElementEvents callbacks, these must be consistent with IndoorMap, even if you don't use it.
  - onClickModel
  - onClickRoomMoreProperties
  - onClickRoomProperties
  - onContainerVisibilityChange
  - onGestureChange
  - onLoggerINfo
  - onMapLoadEnd
  - onModelLoadingProgress
  - onPosPoints
  - onRenderContextLost
  - onRenderContextRestored
  - onRobotPositionChange
  - onScreenSnapshot
  - onSplitLine
  - onVirtualInfoRendered

  See [@tuya/rn-robot-map](https://www.npmjs.com/package/@tuya/rn-robot-map) for details


2. Add ElementProps params for IndoorMap component
  - elementPropsSchema/d3BgColor/index.ts
  - elementPropsSchema/d3WallColor/index.ts
  - elementPropsSchema/d3EditWrapperParams/index.ts
  - elementPropsSchema/maxRoomPropertyLength/index.ts
  - elementPropsSchema/robotParams/index.ts
  - elementPropsSchema/selectParams/index.ts
  - elementPropsSchema/pilePosition/index.ts
  - elementPropsSchema/mergeRoomParams/index.ts

  See [@tuya/rn-robot-map](https://www.npmjs.com/package/@tuya/rn-robot-map) for details

3. Change the parsed method of map data & path data
  - elementPropsSchema/decodePathFn/index.ts
  - elementPropsSchema/mapData/index.ts

4. Add data flow target
  - autoTask/realTimeOriginFullPathWithP2p
  - change realTimeAutoTaskWithP2p、splitEditMapTaskWithP2p、splitEditMapTaskWithP2p to adapt data flow

5. Add screenshots to replace map components in non-interactive map components to reduce performance loss
