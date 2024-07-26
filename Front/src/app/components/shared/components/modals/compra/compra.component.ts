import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-compra',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './compra.component.html',
  styleUrl: './compra.component.scss'
})
export class CompraComponent {
  private dialogRef = inject(MatDialogRef<CompraComponent>);

  onNoClick(): void {
    this.dialogRef.close();
  }
}


