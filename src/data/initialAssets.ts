export interface SoftwarePackage {
  name: string;
  version: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'Web Server' | 'Database Server' | 'Workstation' | 'Cloud VM' | 'Domain Controller';
  operatingSystem: string;
  installedSoftware: SoftwarePackage[];
  department: string;
  owner: string;
  status: 'Active' | 'Maintenance' | 'Isolated';
  ipAddress: string;
  location: string;
}

export const initialAssets: Asset[] = [
  {
    id: 'WebServer-01',
    name: 'WebServer-01',
    type: 'Web Server',
    operatingSystem: 'Ubuntu Server 22.04 LTS',
    installedSoftware: [
      { name: 'PHP', version: '8.1.0' },
      { name: 'Apache HTTP Server', version: '2.4.55' },
      { name: 'libwebp', version: '1.3.1' },
      { name: 'glibc', version: '2.39' }
    ],
    department: 'IT Operations',
    owner: 'Sarah Connor',
    status: 'Active',
    ipAddress: '10.100.1.10',
    location: 'US-East-1 AWS VM'
  },
  {
    id: 'Database-01',
    name: 'Database-01',
    type: 'Database Server',
    operatingSystem: 'Red Hat Enterprise Linux 9',
    installedSoftware: [
      { name: 'curl', version: '8.3.0' },
      { name: 'OpenSSH Server', version: '8.9p1' },
      { name: 'glibc', version: '2.39' }
    ],
    department: 'Finance & Database',
    owner: 'John Doe',
    status: 'Active',
    ipAddress: '10.100.1.20',
    location: 'On-Premise Server Room'
  },
  {
    id: 'Finance-PC-01',
    name: 'Finance-PC-01',
    type: 'Workstation',
    operatingSystem: 'Windows 11 Enterprise',
    installedSoftware: [
      { name: 'curl', version: '8.3.0' },
      { name: 'libwebp', version: '1.3.1' }
    ],
    department: 'Finance',
    owner: 'Alice Vance',
    status: 'Active',
    ipAddress: '192.168.20.15',
    location: 'Corporate HQ 4th Floor'
  },
  {
    id: 'HR-PC-01',
    name: 'HR-PC-01',
    type: 'Workstation',
    operatingSystem: 'Windows 11 Enterprise',
    installedSoftware: [
      { name: 'curl', version: '8.3.0' }
    ],
    department: 'Human Resources',
    owner: 'Bob Jenkins',
    status: 'Active',
    ipAddress: '192.168.20.22',
    location: 'Corporate HQ 3rd Floor'
  },
  {
    id: 'CloudVM-01',
    name: 'CloudVM-01',
    type: 'Cloud VM',
    operatingSystem: 'Debian 11',
    installedSoftware: [
      { name: 'Metabase', version: '0.46.6' },
      { name: 'runc', version: '1.1.11' },
      { name: 'OpenSSH Server', version: '8.9p1' }
    ],
    department: 'Research & Development',
    owner: 'Charlie Miller',
    status: 'Active',
    ipAddress: '54.210.45.89',
    location: 'AWS EC2 Instance (Public Subnet)'
  }
];
