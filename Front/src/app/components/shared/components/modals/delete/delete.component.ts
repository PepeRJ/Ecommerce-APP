import { Component, inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CompraComponent } from '../compra/compra.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-delete',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './delete.component.html',
  styleUrl: './delete.component.scss'
})
export class DeleteComponent {
  private dialogRef = inject(MatDialogRef<CompraComponent>);

  onNoClick(): void {
    this.dialogRef.close();
  }
}

