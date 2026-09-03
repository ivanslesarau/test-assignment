import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Polygon, Point } from '../../store/models/polygon.model';
import { PolygonActions } from '../../store/actions/polygon.actions';
import { selectPolygonsByCharacter } from '../../store/selectors/polygon.selector';

@Component({
  selector: 'app-image-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-dialog.component.html',
})
export class ImageDialogComponent implements AfterViewInit {
  @Input({ required: true }) character!: any;
  @Output() closeDialog = new EventEmitter<void>();
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private store = inject(Store);
  private ctx!: CanvasRenderingContext2D;
  private image = new Image();

  savedPolygons: Polygon[] = [];
  currentPoints: Point[] = [];

  // Drag/Rotate
  selectedPolygon: Polygon | null = null;
  isDragging = false;
  isRotating = false;
  dragStartPoint: Point = { x: 0, y: 0 };
  initialMouseAngle = 0;

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d')!;

    // Load saved polygons from NgRx Store for the current character
    this.store
      .select(selectPolygonsByCharacter(this.character.externalId))
      .subscribe((polygons) => {
        this.savedPolygons = polygons;
        this.redraw();
      });

    // Show the character image on the canvas
    this.image.crossOrigin = 'anonymous';
    this.image.src = this.character.imageUrl;
    this.image.onload = () => {
      canvas.width = this.image.width;
      canvas.height = this.image.height;
      this.redraw();
    };
  }

  redraw(): void {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    this.ctx.drawImage(this.image, 0, 0, canvas.width, canvas.height);

    this.savedPolygons.forEach((poly) => {
      const polyToDraw =
        this.selectedPolygon && this.selectedPolygon.id === poly.id ? this.selectedPolygon : poly;
      this.drawPolygon(polyToDraw);
    });

    if (this.currentPoints.length > 0) {
      this.drawPoints(this.currentPoints);
    }
  }

  private drawPolygon(poly: Polygon): void {
    const canvas = this.canvasRef.nativeElement;
    const center = this.getCentroid(poly.points);

    this.ctx.save();
    // Rotate around the centroid
    this.ctx.translate(center.x * canvas.width, center.y * canvas.height);
    this.ctx.rotate(poly.rotation);
    this.ctx.translate(-center.x * canvas.width, -center.y * canvas.height);

    this.ctx.beginPath();
    poly.points.forEach((pt, i) => {
      const px = pt.x * canvas.width;
      const py = pt.y * canvas.height;
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);
    });
    this.ctx.closePath();

    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    this.ctx.fill();
    this.ctx.strokeStyle = '#2563eb';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();

    this.ctx.restore();
  }

  private drawPoints(points: Point[]): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx.beginPath();
    points.forEach((pt, i) => {
      const px = pt.x * canvas.width;
      const py = pt.y * canvas.height;
      if (i === 0) this.ctx.moveTo(px, py);
      else this.ctx.lineTo(px, py);

      // Draw small circles at each point
      this.ctx.arc(px, py, 4, 0, Math.PI * 2);
    });
    this.ctx.strokeStyle = '#2563eb';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  onMouseDown(event: MouseEvent): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width;
    const relY = (event.clientY - rect.top) / rect.height;

    const clickedPolygon = this.savedPolygons.find((poly) =>
      this.isPointInPolygon({ x: relX, y: relY }, poly.points),
    );

    if (event.altKey && clickedPolygon) {
      this.isRotating = true;
      this.selectedPolygon = JSON.parse(JSON.stringify(clickedPolygon));

      const center = this.getCentroid(this.selectedPolygon!.points);
      this.initialMouseAngle = Math.atan2(relY - center.y, relX - center.x);
    } else if (clickedPolygon) {
      this.isDragging = true;
      this.selectedPolygon = JSON.parse(JSON.stringify(clickedPolygon));
      this.dragStartPoint = { x: relX, y: relY };
    } else {
      this.currentPoints.push({ x: relX, y: relY });
      this.redraw();
    }
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.selectedPolygon) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width;
    const relY = (event.clientY - rect.top) / rect.height;

    if (this.isRotating) {
      const center = this.getCentroid(this.selectedPolygon.points);
      const currentMouseAngle = Math.atan2(relY - center.y, relX - center.x);
      const deltaAngle = currentMouseAngle - this.initialMouseAngle;
      this.selectedPolygon.rotation += deltaAngle;
      this.initialMouseAngle = currentMouseAngle;
      this.redraw();
    } else if (this.isDragging) {
      const dx = relX - this.dragStartPoint.x;
      const dy = relY - this.dragStartPoint.y;

      this.selectedPolygon.points = this.selectedPolygon.points.map((pt) => ({
        x: pt.x + dx,
        y: pt.y + dy,
      }));

      this.dragStartPoint = { x: relX, y: relY };
      this.redraw();
    }
  }

  private isPointInPolygon(point: Point, vs: Point[]): boolean {
    const x = point.x,
      y = point.y;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i].x,
        yi = vs[i].y;
      const xj = vs[j].x,
        yj = vs[j].y;
      const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  onMouseUp(): void {
    if (this.selectedPolygon && (this.isDragging || this.isRotating)) {
      this.store.dispatch(
        PolygonActions.updatePolygon({
          characterId: this.character.externalId,
          polygon: this.selectedPolygon,
        }),
      );
    }

    this.isDragging = false;
    this.isRotating = false;
    this.selectedPolygon = null;
  }

  finishPolygon(): void {
    if (this.currentPoints.length < 3) return;

    const newPolygon: Polygon = {
      id: Date.now().toString(),
      characterId: this.character.externalId,
      points: [...this.currentPoints],
      rotation: 0,
    };

    this.store.dispatch(
      PolygonActions.savePolygon({
        characterId: this.character.externalId,
        polygon: newPolygon,
      }),
    );

    this.currentPoints = [];
    this.redraw();
  }

  clearCurrent(): void {
    this.currentPoints = [];
    this.redraw();
  }

  private getCentroid(points: Point[]): Point {
    const total = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
    return { x: total.x / points.length, y: total.y / points.length };
  }

  close(): void {
    this.closeDialog.emit();
  }
}
