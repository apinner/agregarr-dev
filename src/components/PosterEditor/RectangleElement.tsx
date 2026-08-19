import type Konva from 'konva';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useRef } from 'react';
import { Group, Rect } from 'react-konva';
import type {
  LayeredElement,
  RectangleElementProps,
} from './PosterEditorModal';

interface RectangleElementComponentProps {
  element: LayeredElement;
  isSelected: boolean;
  onSelect: (node: Konva.Node) => void;
  onDragMove: (node: Konva.Node) => void;
  onDragEnd: (x: number, y: number) => void;
  onTransformEnd: (
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number
  ) => void;
}

export const RectangleElement = ({
  element,
  isSelected,
  onSelect,
  onDragMove,
  onDragEnd,
  onTransformEnd,
}: RectangleElementComponentProps) => {
  const props = element.properties as RectangleElementProps;
  const groupRef = useRef<Konva.Group | null>(null);
  const angle = ((props.gradientAngle ?? 0) * Math.PI) / 180;
  const halfWidth = element.width / 2;
  const halfHeight = element.height / 2;
  const gradientStart = {
    x: halfWidth - Math.cos(angle) * halfWidth,
    y: halfHeight - Math.sin(angle) * halfHeight,
  };
  const gradientEnd = {
    x: halfWidth + Math.cos(angle) * halfWidth,
    y: halfHeight + Math.sin(angle) * halfHeight,
  };

  return (
    <Group
      ref={groupRef}
      id={element.id}
      x={element.x + element.width / 2}
      y={element.y + element.height / 2}
      offsetX={element.width / 2}
      offsetY={element.height / 2}
      width={element.width}
      height={element.height}
      rotation={element.rotation || 0}
      draggable
      onClick={() => groupRef.current && onSelect(groupRef.current)}
      onTap={() => groupRef.current && onSelect(groupRef.current)}
      onDragMove={() => groupRef.current && onDragMove(groupRef.current)}
      onDragEnd={(e: KonvaEventObject<DragEvent>) =>
        onDragEnd(
          e.target.x() - element.width / 2,
          e.target.y() - element.height / 2
        )
      }
      onTransformEnd={() => {
        const node = groupRef.current;
        if (!node) return;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        node.scaleX(1);
        node.scaleY(1);
        const width = Math.max(10, Math.round(element.width * scaleX));
        const height = Math.max(10, Math.round(element.height * scaleY));
        onTransformEnd(
          node.x() - width / 2,
          node.y() - height / 2,
          width,
          height,
          node.rotation()
        );
      }}
    >
      <Rect
        width={element.width}
        height={element.height}
        cornerRadius={props.cornerRadius ?? 0}
        opacity={(props.opacity ?? 100) / 100}
        fill={props.fillType === 'solid' ? props.fillColor : undefined}
        fillLinearGradientStartPoint={gradientStart}
        fillLinearGradientEndPoint={gradientEnd}
        fillLinearGradientColorStops={
          props.fillType === 'linear-gradient'
            ? [0, props.fillColor, 1, props.secondaryColor || props.fillColor]
            : undefined
        }
        stroke={props.borderColor}
        strokeWidth={props.borderWidth ?? 0}
      />
      {isSelected && (
        <Rect
          width={element.width}
          height={element.height}
          cornerRadius={props.cornerRadius ?? 0}
          stroke="#ff6b35"
          strokeWidth={2}
          listening={false}
        />
      )}
    </Group>
  );
};
