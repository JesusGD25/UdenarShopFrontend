import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, icons } from 'lucide-angular';

interface IconOption {
  name: string;
  icon: any;
}

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './icon-picker.component.html',
  styleUrl: './icon-picker.component.scss'
})
export class IconPickerComponent {
  @Input() selectedIcon: string = '';
  @Output() iconSelected = new EventEmitter<string>();

  searchTerm: string = '';
  showPicker: boolean = false;

  // Íconos populares para categorías
  popularIcons: IconOption[] = [
    { name: 'Book', icon: icons.Book },
    { name: 'Laptop', icon: icons.Laptop },
    { name: 'Smartphone', icon: icons.Smartphone },
    { name: 'Shirt', icon: icons.Shirt },
    { name: 'House', icon: icons.House },
    { name: 'Car', icon: icons.Car },
    { name: 'Gamepad2', icon: icons.Gamepad2 },
    { name: 'Music', icon: icons.Music },
    { name: 'Camera', icon: icons.Camera },
    { name: 'Bike', icon: icons.Bike },
    { name: 'Heart', icon: icons.Heart },
    { name: 'Gift', icon: icons.Gift },
    { name: 'ShoppingBag', icon: icons.ShoppingBag },
    { name: 'Utensils', icon: icons.Utensils },
    { name: 'Coffee', icon: icons.Coffee },
    { name: 'Dumbbell', icon: icons.Dumbbell },
    { name: 'Paintbrush', icon: icons.Paintbrush },
    { name: 'Hammer', icon: icons.Hammer },
    { name: 'Wrench', icon: icons.Wrench },
    { name: 'GraduationCap', icon: icons.GraduationCap },
    { name: 'Briefcase', icon: icons.Briefcase },
    { name: 'PackageCheck', icon: icons.PackageCheck },
    { name: 'Watch', icon: icons.Watch },
    { name: 'Glasses', icon: icons.Glasses },
    { name: 'Headphones', icon: icons.Headphones },
    { name: 'Monitor', icon: icons.Monitor },
    { name: 'Tv', icon: icons.Tv },
    { name: 'Printer', icon: icons.Printer },
    { name: 'Keyboard', icon: icons.Keyboard },
    { name: 'Mouse', icon: icons.Mouse },
    { name: 'Zap', icon: icons.Zap },
    { name: 'Globe', icon: icons.Globe },
    { name: 'Leaf', icon: icons.Leaf },
    { name: 'Sparkles', icon: icons.Sparkles },
    { name: 'Star', icon: icons.Star },
    { name: 'Award', icon: icons.Award },
  ];

  get filteredIcons(): IconOption[] {
    if (!this.searchTerm) {
      return this.popularIcons;
    }
    return this.popularIcons.filter(icon => 
      icon.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get selectedIconData(): IconOption | undefined {
    return this.popularIcons.find(icon => icon.name === this.selectedIcon);
  }

  togglePicker(): void {
    this.showPicker = !this.showPicker;
  }

  selectIcon(iconName: string): void {
    this.selectedIcon = iconName;
    this.iconSelected.emit(iconName);
    this.showPicker = false;
    this.searchTerm = '';
  }

  closePicker(): void {
    this.showPicker = false;
    this.searchTerm = '';
  }
}
