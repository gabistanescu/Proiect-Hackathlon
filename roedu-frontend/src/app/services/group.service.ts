import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Group, GroupCreate, GroupUpdate, GroupAddStudents, GroupRemoveStudents } from '../models/group.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private apiService: ApiService) { }

  /**
   * Get all groups for the current professor
   */
  getGroups(): Observable<Group[]> {
    return this.apiService.get<Group[]>('/groups');
  }

  /**
   * Get a specific group with all its students
   */
  getGroupById(groupId: number): Observable<Group> {
    return this.apiService.get<Group>(`/groups/${groupId}`);
  }

  /**
   * Create a new group with email-based student selection
   */
  createGroup(groupData: GroupCreate): Observable<Group> {
    return this.apiService.post<Group>('/groups', groupData);
  }

  /**
   * Update group information
   */
  updateGroup(groupId: number, groupData: GroupUpdate): Observable<Group> {
    return this.apiService.put<Group>(`/groups/${groupId}`, groupData);
  }

  /**
   * Delete a group
   */
  deleteGroup(groupId: number): Observable<void> {
    return this.apiService.delete<void>(`/groups/${groupId}`);
  }

  /**
   * Add students to a group by email
   */
  addStudentsToGroup(groupId: number, request: GroupAddStudents): Observable<any> {
    return this.apiService.post(`/groups/${groupId}/students/add`, request);
  }

  /**
   * Remove students from a group
   */
  removeStudentsFromGroup(groupId: number, request: GroupRemoveStudents): Observable<any> {
    return this.apiService.post(`/groups/${groupId}/students/remove`, request);
  }
}
